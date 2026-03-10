import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method !== "POST") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" })
  }

  // تأكد من وجود مجلد التحميلات
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 40 * 1024 * 1024, // حد أقصى 10 ميجابايت
    filename: (name, ext, part) => {
      // إنشاء اسم فريد للملف
      return Date.now() + '_' + part.originalFilename?.replace(/\s/g, '_')
    }
  })

  try {
    // ✅ Promise بدل Callback لتجنب مشاكل الـ TypeScript
    const [fields, files] = await form.parse(req)

    // ✅ التعامل مع File[] | File | undefined
    const fileData = files.file
    const file = Array.isArray(fileData) ? fileData[0] : fileData

    // ✅ التعامل مع string[] | string | undefined
    const caseIdData = fields.caseId
    const caseId = Array.isArray(caseIdData) ? caseIdData[0] : caseIdData

    if (!file || !caseId) {
      return res.status(400).json({ error: 'البيانات غير مكتملة' })
    }

    const document = await prisma.document.create({
      data: {
        caseId,
        name: file.originalFilename || 'ملف',
        filePath: `/uploads/${path.basename(file.filepath)}`,
      }
    })

    return res.json(document)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'فشل رفع الملف أو حفظه في قاعدة البيانات' })
  }
}
