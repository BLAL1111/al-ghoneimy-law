import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'  // ✅ ده اللي ناقص

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  const { id } = req.query
  if (!id || typeof id !== "string") return res.status(400).end()

  // GET: جلب تفاصيل القضية
  if (req.method === "GET") {
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: { 
        client: true,
        sessions: { orderBy: { date: 'desc' } },
        documents: true,
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } }
      }
    })
    if (!caseItem) return res.status(404).end()
    return res.json(caseItem)
  }

  // PUT: تحديث القضية
  else if (req.method === "PUT") {
    const { caseNumber, court, subject, status, filedDate, description } = req.body

    // جلب البيانات القديمة للمقارنة
    const oldCase = await prisma.case.findUnique({ where: { id } })
    if (!oldCase) return res.status(404).end()

    try {
      const updated = await prisma.case.update({
        where: { id },
        data: {
          caseNumber,
          court,
          subject,
          status,
          filedDate: filedDate ? new Date(filedDate) : null,
          description,
          updatedById: session.user.id,
        }
      })

      // حساب التغييرات
      const changes = getChanges(oldCase, req.body)

      // تسجيل التحديث إذا كان هناك تغييرات
      if (changes.length > 0) {
        await createAuditLog(
          session.user.id,
          'UPDATE',
          'Case',
          id,
          changes,
          req
        )
      }

      res.json(updated)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'رقم القضية موجود بالفعل' })
      }
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  // ... في نهاية الملف، في قسم DELETE
else if (req.method === "DELETE") {
  try {
    // تسجيل عملية الحذف في سجل التغييرات
    await createAuditLog(
      session.user.id,
      'DELETE',
      'Case',
      id,
      null,
      req
    )

    await prisma.case.delete({ where: { id } })
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