// إشعارات محلية - بتشتغل من غير سيرفر لما المستخدم يفتح الموقع
// بتتبعت لـ: ADMIN, LAWYER, TRAINEE فقط - مش ACCOUNTANT

const LAST_CHECK_KEY = 'ghoneimy_last_notification_check'
const NOTIFY_ROLES = ['ADMIN', 'LAWYER', 'TRAINEE']

export async function checkAndNotifySessions(userRole?: string) {
  // تأكد إن الدور مسموحله بالإشعارات
  if (userRole && !NOTIFY_ROLES.includes(userRole)) return

  // تأكد إن الإشعارات مسموحة
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  // متبعتش أكتر من مرة كل ساعة
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
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      await reg.showNotification('⚖️ تذكير بجلسة قادمة', {
        body: `جلسة: ${session.case?.caseNumber || ''}\nالعميل: ${session.case?.client?.name || 'غير محدد'}\nالوقت: ${timeStr}`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `local-session-${session.id}`,
        data: { url: '/sessions' },
        // @ts-ignore
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200],
      })
    }
  } catch (err) {
    console.error('Local notification error:', err)
  }
}