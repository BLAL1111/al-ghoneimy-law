import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]' // ✅ نقطتان (تصحيح)
import { prisma } from '@/lib/prisma'
import { createAuditLog, getChanges } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'غير مصرح' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).end()

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!user) return res.status(404).end()
    return res.json(user)
  }

  if (req.method === 'PUT') {
    const { name, email, password, role } = req.body

    const oldUser = await prisma.user.findUnique({ where: { id } })
    if (!oldUser) return res.status(404).end()

    const data: any = { name, email, role }
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true },
      })

      // حساب التغييرات (نحتاج إلى إزالة كلمة المرور من المقارنة)
      const { password: _, ...oldUserWithoutPassword } = oldUser
      const changes = getChanges(oldUserWithoutPassword, { name, email, role })

      if (changes.length > 0) {
        await createAuditLog(
          session.user.id,
          'UPDATE',
          'User',
          id,
          changes,
          req
        )
      }

      return res.json(updated)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
      }
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  if (req.method === 'DELETE') {
    // التحقق من عدم حذف آخر مشرف
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const user = await prisma.user.findUnique({ where: { id } })
    if (user?.role === 'ADMIN' && adminCount <= 1) {
      return res.status(400).json({ error: 'لا يمكن حذف آخر مشرف' })
    }

    try {
      await createAuditLog(
        session.user.id,
        'DELETE',
        'User',
        id,
        null,
        req
      )

      await prisma.user.delete({ where: { id } })
      return res.status(204).end()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  return res.status(405).end()
}