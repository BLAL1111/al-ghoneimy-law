import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'غير مصرح' })
  if (session.user.role !== 'ADMIN') return res.status(403).json({ error: 'للأدمن فقط' })
  if (req.method !== 'POST') return res.status(405).end()

  const { title, body } = req.body
  if (!title || !body) return res.status(400).json({ error: 'العنوان والنص مطلوبان' })

  const subscriptions = await prisma.pushSubscription.findMany()
  if (subscriptions.length === 0) {
    return res.status(200).json({ message: 'مفيش مستخدمين مشتركين', sent: 0 })
  }

  const webpush = await import('web-push')
  webpush.default.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const payload = JSON.stringify({
    title,
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    url: '/',
    tag: `manual-${Date.now()}`,
  })

  let sent = 0
  let failed = 0
  const failedEndpoints: string[] = []

  for (const sub of subscriptions) {
    try {
      await webpush.default.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      sent++
    } catch (error: any) {
      failed++
      if (error.statusCode === 410 || error.statusCode === 404) {
        failedEndpoints.push(sub.endpoint)
      }
    }
  }

  if (failedEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: failedEndpoints } }
    })
  }

  return res.status(200).json({ sent, failed, total: subscriptions.length })
}