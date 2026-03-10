import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]' // ✅ نقطة واحدة
import { prisma } from '@/lib/prisma'
import { createAuditLog, getChanges } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  const { id } = req.query
  if (!id || typeof id !== "string") return res.status(400).end()

  // GET: جلب تفاصيل العميل
  if (req.method === "GET") {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { 
        cases: true,
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } }
      }
    })
    if (!client) return res.status(404).end()
    return res.json(client)
  }

  // PUT: تحديث العميل
  else if (req.method === "PUT") {
    const { name, phone, email, address } = req.body

    // جلب البيانات القديمة
    const oldClient = await prisma.client.findUnique({ where: { id } })
    if (!oldClient) return res.status(404).end()

    try {
      const updated = await prisma.client.update({
        where: { id },
        data: {
          name,
          phone,
          email,
          address,
          updatedById: session.user.id,
        }
      })

      // حساب التغييرات
      const changes = getChanges(oldClient, req.body)

      if (changes.length > 0) {
        await createAuditLog(
          session.user.id,
          'UPDATE',
          'Client',
          id,
          changes,
          req
        )
      }

      res.json(updated)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
      }
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  // DELETE: حذف العميل
  else if (req.method === "DELETE") {
    try {
      await createAuditLog(
        session.user.id,
        'DELETE',
        'Client',
        id,
        null,
        req
      )
  
      await prisma.client.delete({ where: { id } })
      res.status(204).end()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }
  else {
    res.status(405).end()
  }
}