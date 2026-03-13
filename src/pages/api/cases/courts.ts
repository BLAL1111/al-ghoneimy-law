import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

// ✅ API يرجع كل أسماء المحاكم الموجودة (بدون تكرار)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method !== 'GET') return res.status(405).end()

  const cases = await prisma.case.findMany({
    where: { court: { not: null } },
    select: { court: true },
    distinct: ['court'],
    orderBy: { court: 'asc' }
  })

  const courts = cases.map(c => c.court).filter(Boolean)
  return res.json(courts)
}