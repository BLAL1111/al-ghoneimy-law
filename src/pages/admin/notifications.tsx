import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { BellIcon, PaperAirplaneIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

export default function NotificationsAdmin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('مكتب الغنيمي للمحاماة')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [permission, setPermission] = useState<string>('default')
  const [swReady, setSwReady] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/")
  }, [status, session, router])

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true))
    }
  }, [])

  const enableNotifications = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      // اشترك في الـ push
      try {
        const reg = await navigator.serviceWorker.ready
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) { toast.error('مفتاح الإشعارات غير متوفر'); return }

        const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4)
        const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray,
        })

        const p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('p256dh')!))))
        const auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('auth')!))))

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh, auth } }),
        })
        toast.success('تم تفعيل الإشعارات!')
      } catch (err) {
        toast.error('حدث خطأ في التفعيل')
      }
    }
  }

  const sendNow = async () => {
    if (!body.trim()) { toast.error('اكتب نص الإشعار'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/notifications/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        if (data.sent > 0) toast.success(`تم الإرسال لـ ${data.sent} مستخدم!`)
        else toast.error(data.message || 'مفيش مستخدمين مشتركين')
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <BellIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إرسال إشعار فوري</h1>
      </div>

      {/* حالة الإشعارات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm">حالة جهازك</h2>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">Service Worker</span>
          <span className={`text-sm font-medium ${swReady ? 'text-green-600' : 'text-red-500'}`}>
            {swReady ? '✅ مفعّل' : '❌ غير مفعّل'}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">إذن الإشعارات</span>
          <span className={`text-sm font-medium ${
            permission === 'granted' ? 'text-green-600' :
            permission === 'denied' ? 'text-red-500' : 'text-orange-500'
          }`}>
            {permission === 'granted' ? '✅ مسموح' :
             permission === 'denied' ? '❌ مرفوض' : '⏳ لم يُحدَّد'}
          </span>
        </div>
        {permission !== 'granted' && (
          <button onClick={enableNotifications}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            🔔 فعّل الإشعارات على جهازك أولاً
          </button>
        )}
      </div>

      {/* فورم الإرسال */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
        <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm">محتوى الإشعار</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص الإشعار *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            placeholder="اكتب الرسالة هنا..."
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <button
          onClick={sendNow}
          disabled={loading || !body.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          {loading ? 'جاري الإرسال...' : 'إرسال لكل المستخدمين الآن'}
        </button>
      </div>

      {/* نتيجة الإرسال */}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-green-700 dark:text-green-400">نتيجة الإرسال</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{result.sent}</p>
              <p className="text-xs text-gray-500 mt-1">تم الإرسال</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-gray-500 mt-1">فشل</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{result.total}</p>
              <p className="text-xs text-gray-500 mt-1">إجمالي</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}