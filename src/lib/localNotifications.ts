import { Capacitor } from '@capacitor/core'

const LAST_SCHEDULE_KEY = 'ghoneimy_last_schedule'

// جدول إشعارات الجلسات على الجهاز (بتشتغل من غير نت)
export async function scheduleSessionNotifications() {
  // لو مش على Android/iOS استخدم الـ Web Push بدل كده
  if (!Capacitor.isNativePlatform()) {
    await checkAndNotifySessionsWeb()
    return
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    // اطلب إذن الإشعارات
    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== 'granted') return

    // متجدلش أكتر من مرة كل 6 ساعات
    const lastSchedule = localStorage.getItem(LAST_SCHEDULE_KEY)
    if (lastSchedule) {
      const diff = Date.now() - parseInt(lastSchedule)
      if (diff < 6 * 60 * 60 * 1000) return
    }

    // جيب الجلسات القادمة
    const res = await fetch('/api/sessions?upcoming=true')
    if (!res.ok) return
    const sessions = await res.json()

    if (!sessions || sessions.length === 0) return

    // الغِ الإشعارات القديمة
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }

    const notifications = []
    const now = new Date()

    for (const session of sessions) {
      const sessionDate = new Date(session.date)
      if (sessionDate <= now) continue

      // إشعار قبل يوم
      const dayBefore = new Date(sessionDate)
      dayBefore.setDate(dayBefore.getDate() - 1)
      dayBefore.setHours(9, 0, 0, 0)

      if (dayBefore > now) {
        notifications.push({
          id: Math.floor(Math.random() * 100000),
          title: '⚖️ تذكير بجلسة غداً',
          body: `القضية: ${session.case?.caseNumber || ''} | العميل: ${session.case?.client?.name || 'غير محدد'}`,
          schedule: { at: dayBefore },
          extra: { url: '/sessions', sessionId: session.id },
          channelId: 'sessions',
        })
      }

      // إشعار قبل ساعتين
      const twoHoursBefore = new Date(sessionDate)
      twoHoursBefore.setHours(twoHoursBefore.getHours() - 2)

      if (twoHoursBefore > now) {
        const timeStr = sessionDate.toLocaleTimeString('ar-EG', {
          hour: '2-digit', minute: '2-digit', hour12: true
        })
        notifications.push({
          id: Math.floor(Math.random() * 100000),
          title: '⚠️ جلسة بعد ساعتين!',
          body: `القضية: ${session.case?.caseNumber || ''} | الساعة: ${timeStr} | العميل: ${session.case?.client?.name || 'غير محدد'}`,
          schedule: { at: twoHoursBefore },
          extra: { url: '/sessions', sessionId: session.id },
          channelId: 'sessions',
        })
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications })
      localStorage.setItem(LAST_SCHEDULE_KEY, Date.now().toString())
      console.log(`✅ تم جدولة ${notifications.length} إشعار`)
    }

    // إعداد listener للنقر على الإشعار
    await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const url = action.notification.extra?.url
      if (url) window.location.href = url
    })

  } catch (err) {
    console.error('Local notification error:', err)
  }
}

// للويب (مش Android)
const LAST_CHECK_KEY = 'ghoneimy_last_notification_check'

export async function checkAndNotifySessionsWeb() {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const lastCheck = localStorage.getItem(LAST_CHECK_KEY)
  if (lastCheck) {
    const diff = Date.now() - parseInt(lastCheck)
    if (diff < 60 * 60 * 1000) return
  }

  try {
    const res = await fetch('/api/sessions')
    if (!res.ok) return
    const sessions = await res.json()

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const upcoming = sessions.filter((s: any) => {
      const sessionDate = new Date(s.date)
      return sessionDate > now && sessionDate <= in24h
    })

    if (upcoming.length === 0) return

    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString())

    const reg = await navigator.serviceWorker.ready
    for (const session of upcoming) {
      const sessionDate = new Date(session.date)
      const timeStr = sessionDate.toLocaleTimeString('ar-EG', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })

      await reg.showNotification('⚖️ تذكير بجلسة قادمة', {
        body: `القضية: ${session.case?.caseNumber || ''}\nالعميل: ${session.case?.client?.name || 'غير محدد'}\nالوقت: ${timeStr}`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `local-session-${session.id}`,
        data: { url: '/sessions' },
        // @ts-ignore
        dir: 'rtl',
        // @ts-ignore
        lang: 'ar',
        // @ts-ignore
        vibrate: [200, 100, 200],
      })
    }
  } catch (err) {
    console.error('Web notification error:', err)
  }
}