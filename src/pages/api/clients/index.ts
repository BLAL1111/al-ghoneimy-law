import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "GET") {
    const clients = await prisma.client.findMany({
      include: { cases: true },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(clients)
  }

  else if (req.method === "POST") {
    const { name, phone, email, address } = req.body
    if (!name) return res.status(400).json({ error: 'الاسم مطلوب' })

    // ✅ منع تكرار الاسم (بغض النظر عن الحروف الكبيرة/الصغيرة والمسافات الزائدة)
    const normalizedName = name.trim().replace(/\s+/g, ' ')
    const existing = await prisma.client.findFirst({
      where: {
        name: { equals: normalizedName, mode: 'insensitive' }
      }
    })
    if (existing) {
      return res.status(400).json({ error: `يوجد عميل بنفس الاسم بالفعل: "${existing.name}"` })
    }

    try {
      const newClient = await prisma.client.create({
        data: {
          name: normalizedName,
          phone: phone || null,
          email: email || null,
          address: address || null,
          createdById: session.user.id,
        }
      })
      await createAuditLog(session.user.id, 'CREATE', 'Client', newClient.id, null, req)
      return res.json(newClient)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
      }
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else return res.status(405).end()
}