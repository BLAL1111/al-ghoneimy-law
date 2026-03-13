import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'غير مصرح' })

  if (req.method === 'POST') {
    const { endpoint, keys } = req.body
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'بيانات ناقصة' })
    }

    try {
      await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: session.user.id,
        },
        create: {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: session.user.id,
        },
      })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Subscribe error:', error)
      return res.status(500).json({ error: 'خطأ في الخادم' })
    }
  }

  if (req.method === 'DELETE') {
    const { endpoint } = req.body
    if (!endpoint) return res.status(400).json({ error: 'endpoint مطلوب' })

    try {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId: session.user.id },
      })
      return res.status(200).json({ success: true })
    } catch {
      return res.status(500).json({ error: 'خطأ في الخادم' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}