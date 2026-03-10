import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'غير مصرح' })
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return res.json(users)
  }

  if (req.method === 'POST') {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'البيانات ناقصة' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'LAWYER',
        },
      })

      // تسجيل إنشاء المستخدم
      await createAuditLog(
        session.user.id,
        'CREATE',
        'User',
        user.id,
        null,
        req
      )

      return res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
      }
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  return res.status(405).end()
}