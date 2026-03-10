import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "GET") {
    const clients = await prisma.client.findMany()
    return res.json(clients)
  } 
  
  else if (req.method === "POST") {
    const { name, phone, email, address } = req.body
    try {
      const newClient = await prisma.client.create({
        data: {
          name,
          phone,
          email,
          address,
          createdById: session.user.id,
        }
      })

      // تسجيل عملية الإنشاء
      await createAuditLog(
        session.user.id,
        'CREATE',
        'Client',
        newClient.id,
        null,
        req
      )

      res.json(newClient)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
      }
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else {
    res.status(405).end()
  }
}