import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from "@/lib/prisma"
import { createAuditLog } from '@/lib/audit'
import formidable from "formidable"
import fs from "fs"
import path from "path"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method === "POST") {
    const uploadDir = path.join(process.cwd(), "public/uploads")
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const form = formidable({ 
      uploadDir, 
      keepExtensions: true, 
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        return Date.now() + "_" + part.originalFilename?.replace(/\s/g, '_')
      }
    })

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message })

      const file = files.file as formidable.File
      const caseId = fields.caseId as string

      if (!caseId || !file) return res.status(400).json({ error: "Missing data" })

      try {
        const document = await prisma.document.create({
          data: {
            caseId,
            name: file.originalFilename || "ملف",
            filePath: `/uploads/${path.basename(file.filepath)}`,
            createdById: session.user.id,
          }
        })

        // تسجيل عملية الرفع
        await createAuditLog(
          session.user.id,
          'CREATE',
          'Document',
          document.id,
          null,
          req
        )

        res.json(document)
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'حدث خطأ في حفظ البيانات' })
      }
    })
  } else {
    res.status(405).end()
  }
}