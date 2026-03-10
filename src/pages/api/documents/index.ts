import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "GET") {
    const documents = await prisma.document.findMany({
      include: { 
        case: true,
        createdBy: { select: { name: true } }
      },
      orderBy: { uploadedAt: 'desc' }
    })
    return res.json(documents)
  } 
  
  else if (req.method === "POST") {
    const { caseId, name, filePath } = req.body
    try {
      const newDocument = await prisma.document.create({
        data: {
          caseId,
          name,
          filePath,
          createdById: session.user.id,
        }
      })

      await createAuditLog(
        session.user.id,
        'CREATE',
        'Document',
        newDocument.id,
        null,
        req
      )

      res.json(newDocument)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  }

  else {
    res.status(405).end()
  }
}