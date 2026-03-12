import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })
  if (!['ADMIN', 'ACCOUNTANT'].includes(session.user.role)) {
    return res.status(403).json({ error: "للمدراء والمحاسبين فقط" })
  }

  if (req.method === "GET") {
    const transactions = await prisma.finance.findMany({
      orderBy: { date: 'asc' },
      include: {
        createdBy: { select: { name: true } },
        attachments: true,
      }
    })
    return res.json(transactions)
  }

  else if (req.method === "POST") {
    const { date, description, debit, credit, notes } = req.body
    if (!date || !description) {
      return res.status(400).json({ error: 'التاريخ والبيان مطلوبان' })
    }
    try {
      const transaction = await prisma.finance.create({
        data: {
          date: new Date(date),
          description,
          debit: debit ? parseFloat(debit) : 0,
          credit: credit ? parseFloat(credit) : 0,
          notes: notes || null,
          createdById: session.user.id,
        },
        include: { attachments: true }
      })
      return res.json(transaction)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else {
    return res.status(405).end()
  }
}
