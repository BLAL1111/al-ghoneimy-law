import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })
  if (session.user.role !== 'ADMIN') return res.status(403).json({ error: "للمدراء فقط" })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).end()

  if (req.method === "PUT") {
    const { date, description, debit, credit, notes } = req.body
    try {
      const updated = await prisma.finance.update({
        where: { id },
        data: {
          date: new Date(date),
          description,
          debit: debit ? parseFloat(debit) : 0,
          credit: credit ? parseFloat(credit) : 0,
          notes: notes || null,
          updatedById: session.user.id,
        }
      })
      return res.json(updated)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else if (req.method === "DELETE") {
    try {
      await prisma.finance.delete({ where: { id } })
      return res.status(204).end()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else {
    return res.status(405).end()
  }
}