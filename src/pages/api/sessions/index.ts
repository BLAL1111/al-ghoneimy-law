import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "GET") {
    const sessions = await prisma.session.findMany({
      include: { 
        case: { include: { client: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    })
    return res.json(sessions)
  } 
  
  else if (req.method === "POST") {
    const { caseId, date, notes } = req.body
    try {
      const newSession = await prisma.session.create({
        data: {
          caseId,
          date: new Date(date),
          notes,
          createdById: session.user.id,
        },
        include: { case: true }
      })

      await createAuditLog(
        session.user.id,
        'CREATE',
        'Session',
        newSession.id,
        null,
        req
      )

      res.json(newSession)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else {
    res.status(405).end()
  }
}