import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from '@/lib/supabase'
import formidable from "formidable"
import fs from "fs"
import path from "path"
import os from "os"

export const config = {
  api: { bodyParser: false },
}

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "غير مصرح" })
  if (!['ADMIN', 'ACCOUNTANT'].includes(session.user.role)) {
    return res.status(403).json({ error: "للمدراء والمحاسبين فقط" })
  }
  if (req.method !== "POST") return res.status(405).end()

  const form = formidable({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  })

  try {
    const [fields, files] = await form.parse(req)
    const fileData = files.file
    const file = Array.isArray(fileData) ? fileData[0] : fileData
    const financeIdData = fields.financeId
    const financeId = Array.isArray(financeIdData) ? financeIdData[0] : financeIdData

    if (!financeId || !file) {
      return res.status(400).json({ error: "البيانات غير مكتملة" })
    }

    const fileExt = path.extname(file.originalFilename || '').toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      fs.unlinkSync(file.filepath)
      return res.status(400).json({ error: `الأنواع المسموحة: PDF, JPG, PNG` })
    }

    const fileBuffer = fs.readFileSync(file.filepath)
    const fileName = `finance/${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'file'}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      })

    fs.unlinkSync(file.filepath)

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return res.status(500).json({ error: 'فشل رفع الملف' })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(fileName)

    const attachment = await prisma.financeAttachment.create({
      data: {
        financeId,
        name: file.originalFilename || "ملف",
        filePath: urlData.publicUrl,
      }
    })

    return res.json(attachment)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}
