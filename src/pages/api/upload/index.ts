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

// ✅ الامتدادات المسموح بها فقط
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method !== "POST") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" })
  }

  const uploadDir = path.join(process.cwd(), "public/uploads")
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name, ext, part) => {
      // ✅ اسم فريد وآمن للملف
      const safeName = part.originalFilename?.replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'file'
      return `${Date.now()}_${safeName}`
    }
  })

  try {
    // ✅ Promise بدل Callback
    const [fields, files] = await form.parse(req)

    // ✅ التعامل مع File[] | undefined
    const fileData = files.file
    const file = Array.isArray(fileData) ? fileData[0] : fileData

    // ✅ التعامل مع string[] | undefined
    const caseIdData = fields.caseId
    const caseId = Array.isArray(caseIdData) ? caseIdData[0] : caseIdData

    if (!caseId || !file) {
      return res.status(400).json({ error: "البيانات غير مكتملة" })
    }

    // ✅ التحقق من امتداد الملف
    const fileExt = path.extname(file.originalFilename || '').toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      fs.unlinkSync(file.filepath)
      return res.status(400).json({
        error: `نوع الملف غير مسموح. الأنواع المسموحة: ${ALLOWED_EXTENSIONS.join(', ')}`
      })
    }

    // ✅ التحقق من وجود القضية
    const caseExists = await prisma.case.findUnique({ where: { id: caseId } })
    if (!caseExists) {
      fs.unlinkSync(file.filepath)
      return res.status(404).json({ error: "القضية غير موجودة" })
    }

    const document = await prisma.document.create({
      data: {
        caseId,
        name: file.originalFilename || "ملف",
        filePath: `/uploads/${path.basename(file.filepath)}`,
        createdById: session.user.id,
      }
    })

    // ✅ تسجيل عملية الرفع
    await createAuditLog(
      session.user.id,
      'CREATE',
      'Document',
      document.id,
      null,
      req
    )

    return res.json(document)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'حدث خطأ في حفظ البيانات' })
  }
}
