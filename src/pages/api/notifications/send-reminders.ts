import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

// دي الـ API اللي هيتنادي من Vercel Cron كل يوم الساعة 8 الصبح
// وكمان بتدعم إرسال إشعار فوري للكل عن طريق mode=now
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // أمان - تحقق من السر
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ✅ وضع الإرسال الفوري - لو جه mode=now مع title و body
  const mode = req.query.mode || req.body?.mode
  if (mode === 'now') {
    const title = req.query.title as string || req.body?.title
    const body = req.query.body as string || req.body?.body

    if (!title || !body) {
      return res.status(400).json({ error: 'title و body مطلوبان في وضع now' })
    }

    const subscriptions = await prisma.pushSubscription.findMany()
    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'مفيش subscriptions', sent: 0 })
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

    return res.status(200).json({ message: 'تم إرسال الإشعار الفوري', sent, failed, total: subscriptions.length })
  }

  // ✅ الوضع الافتراضي - إشعارات الجلسات (Cron)
  try {
    // ابحث عن الجلسات اللي هتكون بكره
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const upcomingSessions = await prisma.session.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    })

    if (upcomingSessions.length === 0) {
      return res.status(200).json({ message: 'مفيش جلسات بكره', sent: 0 })
    }

    // جيب كل الـ subscriptions
    const subscriptions = await prisma.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'مفيش subscriptions', sent: 0 })
    }

    // ابعت الإشعارات
    const webpush = await import('web-push')
    webpush.default.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:admin@example.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    let sent = 0
    let failed = 0
    const failedEndpoints: string[] = []

    for (const sub of subscriptions) {
      for (const session of upcomingSessions) {
        const sessionDate = new Date(session.date)
        const timeStr = sessionDate.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })

        const payload = JSON.stringify({
          title: '⚖️ تذكير بجلسة غداً',
          body: `جلسة القضية: ${session.case.caseNumber}\nالعميل: ${session.case.client?.name || 'غير محدد'}\nالوقت: ${timeStr}`,
          icon: '/logo.png',
          badge: '/logo.png',
          url: `/sessions`,
          tag: `session-${session.id}`,
        })

        try {
          await webpush.default.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          )
          sent++
        } catch (error: any) {
          failed++
          // لو الـ subscription منتهية، احذفها
          if (error.statusCode === 410 || error.statusCode === 404) {
            failedEndpoints.push(sub.endpoint)
          }
        }
      }
    }

    // احذف الـ subscriptions المنتهية
    if (failedEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: failedEndpoints } },
      })
    }

    return res.status(200).json({
      message: `تم إرسال الإشعارات`,
      sessions: upcomingSessions.length,
      sent,
      failed,
      deletedExpired: failedEndpoints.length,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: 'خطأ في الخادم' })
  }
}