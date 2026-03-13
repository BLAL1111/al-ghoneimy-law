import Head from 'next/head'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  HomeIcon, BriefcaseIcon, UsersIcon, CalendarIcon, DocumentTextIcon,
  ChartBarIcon, QuestionMarkCircleIcon, PhoneIcon, MapPinIcon,
  SunIcon, MoonIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon,
  UserGroupIcon, BanknotesIcon, DevicePhoneMobileIcon, BellIcon, XCircleIcon,
} from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'الرئيسية', href: '/', icon: HomeIcon },
  { name: 'القضايا', href: '/cases', icon: BriefcaseIcon },
  { name: 'العملاء', href: '/clients', icon: UsersIcon },
  { name: 'الجلسات', href: '/sessions', icon: CalendarIcon },
  { name: 'المستندات', href: '/documents', icon: DocumentTextIcon },
  { name: 'التقارير', href: '/reports', icon: ChartBarIcon },
  { name: 'مساعدة', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'النظام المالي', href: '/finance', icon: BanknotesIcon, roles: ['ADMIN', 'ACCOUNTANT'] },
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: UserGroupIcon, adminOnly: true },
]

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 4000)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') toast.success('تم تثبيت التطبيق!')
    setDeferredPrompt(null)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-3 left-3 z-50 mx-auto max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl flex-shrink-0">
          <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-white text-sm">ثبّت التطبيق</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">أضف التطبيق لشاشتك الرئيسية</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleInstall} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
            تثبيت
          </button>
          <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PushNotificationBanner() {
  const { data: session } = useSession()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    const timer = setTimeout(() => setShow(true), 10000)
    return () => clearTimeout(timer)
  }, [session])

  const subscribe = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('تم رفض الإشعارات')
        setShow(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { toast.error('مفتاح الإشعارات غير متوفر'); setShow(false); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
          },
        }),
      })
      toast.success('تم تفعيل إشعارات الجلسات!')
      setShow(false)
    } catch (err) {
      toast.error('حدث خطأ في تفعيل الإشعارات')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed top-16 lg:top-4 right-3 left-3 z-50 mx-auto max-w-sm">
      <div className="bg-indigo-700 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
          <BellIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">فعّل إشعارات الجلسات</p>
          <p className="text-xs text-indigo-200">سنذكّرك تلقائياً قبل كل جلسة</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={subscribe} disabled={loading}
            className="bg-white text-indigo-700 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-50 transition-colors disabled:opacity-60">
            {loading ? '...' : 'تفعيل'}
          </button>
          <button onClick={() => setShow(false)} className="text-indigo-300 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const isLoginPage = router.pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  // إغلاق الـ sidebar عند تغيير الصفحة
  useEffect(() => { setSidebarOpen(false) }, [router.pathname])

  if (isLoginPage) return <>{children}</>

  const filteredNav = navigation.filter(item => {
    if (item.roles) return item.roles.includes(session?.user?.role || '')
    if (item.adminOnly) return session?.user?.role === 'ADMIN'
    return true
  })

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:w-68 xl:w-72
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          <Link href="/" className="p-4 border-b dark:border-gray-700 bg-gradient-to-l from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-800 flex items-center gap-3">
            <Image src="/logo.png" alt="الغنيمي" width={52} height={52} className="rounded-xl border-2 border-indigo-100 dark:border-indigo-800 shadow-md object-cover flex-shrink-0" priority />
            <div>
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-800 to-indigo-600 dark:from-indigo-300 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
                الغنيمي للمحاماة
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">استشارات قانونية</p>
            </div>
          </Link>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 left-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
              return (
                <Link key={item.name} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t dark:border-gray-700 space-y-2">
            {session?.user && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.role}</p>
              </div>
            )}
            <button onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors text-sm">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              تسجيل الخروج
            </button>
            <button onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              {theme === 'light' ? <><MoonIcon className="w-4 h-4" />الوضع الليلي</> : <><SunIcon className="w-4 h-4" />الوضع النهاري</>}
            </button>
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1 px-1">
              <div className="flex items-center gap-1.5"><PhoneIcon className="w-3 h-3" /><span dir="ltr">01126118276 · 01003651199</span></div>
              <div className="flex items-center gap-1.5"><MapPinIcon className="w-3 h-3" /><span>6 أكتوبر - الحجاز مول</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-3 py-2.5 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg bg-indigo-600 text-white shadow">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-gray-800 dark:text-white">الغنيمي للمحاماة</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-auto p-3 lg:p-6">
          {children}
        </div>
      </div>

      <InstallPrompt />
      <PushNotificationBanner />
    </div>
  )
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="application-name" content="مكتب الغنيمي للمحاماة" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="الغنيمي" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider>
          <Toaster position="top-center" reverseOrder={false}
            toastOptions={{ style: { fontFamily: 'inherit', direction: 'rtl' }, duration: 3000 }} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </SessionProvider>
    </>
  )
}

export default MyApp