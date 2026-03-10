import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]' // ✅ نقطة واحدة
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "GET") {
    const cases = await prisma.case.findMany({
      include: { client: true }
    })
    res.json(cases)
  } 
  else if (req.method === "POST") {
    const { caseNumber, court, subject, clientId, filedDate, description } = req.body
    try {
      const newCase = await prisma.case.create({
        data: {
          caseNumber,
          court,
          subject,
          clientId,
          filedDate: filedDate ? new Date(filedDate) : null,
          description,
          createdById: session.user.id,
        },
        include: { client: true }
      })

      // تسجيل عملية الإنشاء في سجل التغييرات
      await createAuditLog(
        session.user.id,
        'CREATE',
        'Case',
        newCase.id,
        null, // لا توجد تغييرات لأنها عملية إنشاء
        req
      )

      res.json(newCase)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'رقم القضية موجود بالفعل' })
      }
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }
  else {
    res.status(405).end()
  }
}