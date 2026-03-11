import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from "@/lib/prisma"
import { createAuditLog } from '@/lib/audit'
import { supabaseAdmin } from '@/lib/supabase'
import formidable from "formidable"
import fs from "fs"
import path from "path"
import os from "os"

export const config = {
  api: {
    bodyParser: false,
  },
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })

  if (req.method !== "POST") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" })
  }

  // ✅ مجلد مؤقت بدل public/uploads (Vercel لا يدعم الكتابة على الـ filesystem)
  const form = formidable({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name, ext, part) => {
      const safeName: string = part.originalFilename?.replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'file'
      return `${Date.now()}_${safeName}`
    }
  })

  try {
    const [fields, files] = await form.parse(req)

    const fileData = files.file
    const file = Array.isArray(fileData) ? fileData[0] : fileData

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

    // ✅ رفع الملف على Supabase Storage
    const fileBuffer = fs.readFileSync(file.filepath)
    const fileName = `${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'file'}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      })

    // ✅ احذف الملف المؤقت دايماً بعد الرفع
    fs.unlinkSync(file.filepath)

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return res.status(500).json({ error: 'فشل رفع الملف على السيرفر' })
    }

    // ✅ جيب الرابط العام من Supabase
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(fileName)

    // ✅ احفظ رابط Supabase في قاعدة البيانات بدل /uploads/...
    const document = await prisma.document.create({
      data: {
        caseId,
        name: file.originalFilename || "ملف",
        filePath: urlData.publicUrl,
        createdById: session.user.id,
      }
    })

    await createAuditLog(session.user.id, 'CREATE', 'Document', document.id, null, req)

    return res.json(document)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'حدث خطأ في حفظ البيانات' })
  }
}