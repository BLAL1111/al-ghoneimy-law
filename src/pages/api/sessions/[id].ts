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

  // GET: جلب تفاصيل الجلسة
  if (req.method === "GET") {
    const sessionItem = await prisma.session.findUnique({
      where: { id },
      include: {
        case: { include: { client: true } },
        createdBy: { select: { name: true } }
      }
    })
    if (!sessionItem) return res.status(404).end()
    return res.json(sessionItem)
  }

  // PUT: تحديث الجلسة
  else if (req.method === "PUT") {
    const { date, notes } = req.body

    const oldSession = await prisma.session.findUnique({ where: { id } })
    if (!oldSession) return res.status(404).end()

    try {
      const updated = await prisma.session.update({
        where: { id },
        data: {
          date: new Date(date),
          notes,
          updatedById: session.user.id,
        }
      })

      const changes = getChanges(oldSession, req.body)
      if (changes.length > 0) {
        await createAuditLog(
          session.user.id,
          'UPDATE',
          'Session',
          id,
          changes,
          req
        )
      }

      res.json(updated)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  // DELETE: حذف الجلسة
  else if (req.method === "DELETE") {
    try {
      await createAuditLog(
        session.user.id,
        'DELETE',
        'Session',
        id,
        null,
        req
      )

      await prisma.session.delete({ where: { id } })
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