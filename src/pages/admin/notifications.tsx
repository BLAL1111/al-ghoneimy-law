import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { BellIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

export default function NotificationsTest() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [permission, setPermission] = useState<string>('default')
  const [swReady, setSwReady] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/")
  }, [status, session, router])

  useEffect(() => {
    // تحقق من حالة الإشعارات
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    // تحقق من الـ Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true))
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('المتصفح لا يدعم الإشعارات')
      return
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      toast.success('تم تفعيل الإشعارات ✅')
    } else {
      toast.error('تم رفض الإشعارات')
    }
  }

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      toast.error('فعّل الإشعارات أولاً')
      return
    }

    if (!swReady) {
      // إشعار عادي بدون service worker
      new Notification('مكتب الغنيمي للمحاماة', {
        body: 'هذا إشعار تجريبي من النظام ✅',
        icon: '/logo.png',
        dir: 'rtl',
        lang: 'ar',
      })
      toast.success('تم إرسال الإشعار!')
      return
    }

    // إشعار عبر Service Worker
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification('مكتب الغنيمي للمحاماة', {
      body: 'هذا إشعار تجريبي من النظام ✅',
      icon: '/logo.png',
      badge: '/logo.png',
      dir: 'rtl',
      lang: 'ar',
      // @ts-ignore
      vibrate: [200, 100, 200],
      tag: 'test-notification',
    })
    toast.success('تم إرسال الإشعار!')
  }

  const sendCaseNotification = async () => {
    if (permission !== 'granted') {
      toast.error('فعّل الإشعارات أولاً')
      return
    }
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification('تذكير بجلسة قادمة', {
      body: 'القضية رقم 546 - جلسة غداً الساعة 10 صباحاً',
      icon: '/logo.png',
      dir: 'rtl',
      lang: 'ar',
      // @ts-ignore
      vibrate: [200, 100, 200],
      tag: 'session-notification',
    })
    toast.success('تم إرسال إشعار الجلسة!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <BellIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">اختبار الإشعارات</h1>
      </div>

      {/* حالة النظام */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">حالة النظام</h2>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-700 dark:text-gray-300">Service Worker</span>
          {swReady ? (
            <span className="flex items-center gap-1 text-green-600"><CheckCircleIcon className="w-5 h-5" /> مفعّل</span>
          ) : (
            <span className="flex items-center gap-1 text-red-500"><XCircleIcon className="w-5 h-5" /> غير مفعّل</span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-700 dark:text-gray-300">إذن الإشعارات</span>
          <span className={`flex items-center gap-1 font-medium ${
            permission === 'granted' ? 'text-green-600' :
            permission === 'denied' ? 'text-red-500' : 'text-orange-500'
          }`}>
            {permission === 'granted' ? <><CheckCircleIcon className="w-5 h-5" /> مسموح</> :
             permission === 'denied' ? <><XCircleIcon className="w-5 h-5" /> مرفوض</> :
             '⏳ في الانتظار'}
          </span>
        </div>
      </div>

      {/* أزرار الاختبار */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">اختبار الإشعارات</h2>

        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            🔔 تفعيل الإشعارات
          </button>
        )}

        <button
          onClick={sendTestNotification}
          disabled={permission !== 'granted'}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-medium"
        >
          إرسال إشعار تجريبي
        </button>

        <button
          onClick={sendCaseNotification}
          disabled={permission !== 'granted'}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-medium"
        >
          إشعار تذكير بجلسة
        </button>

        {permission === 'denied' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
            ⚠️ الإشعارات مرفوضة. روح إعدادات المتصفح وفعّلها يدوياً للموقع ده.
          </div>
        )}
      </div>
    </div>
  )
}
