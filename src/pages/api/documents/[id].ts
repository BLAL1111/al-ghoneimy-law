import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  const { id } = req.query
  if (!id || typeof id !== "string") return res.status(400).end()

  if (req.method === "DELETE") {
    try {
      // جلب معلومات المستند لمعرفة مسار الملف الفعلي
      const document = await prisma.document.findUnique({ where: { id } })
      if (!document) return res.status(404).end()

      // حذف الملف الفعلي من السيرفر
      const filePath = path.join(process.cwd(), 'public', document.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      // تسجيل عملية الحذف
      await createAuditLog(
        session.user.id,
        'DELETE',
        'Document',
        id,
        null,
        req
      )

      // حذف السجل من قاعدة البيانات
      await prisma.document.delete({ where: { id } })
      res.status(204).end()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'حدث خطأ' })
    }
  } else {
    res.status(405).end()
  }
}