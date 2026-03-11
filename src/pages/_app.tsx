import Head from 'next/head'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { 
  
  HomeIcon, 
  BriefcaseIcon, 
  UsersIcon, 
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const navigation = [
  { name: 'الرئيسية', href: '/', icon: HomeIcon },
  { name: 'القضايا', href: '/cases', icon: BriefcaseIcon },
  { name: 'العملاء', href: '/clients', icon: UsersIcon },
  { name: 'الجلسات', href: '/sessions', icon: CalendarIcon },
  { name: 'المستندات', href: '/documents', icon: DocumentTextIcon },
  { name: 'التقارير', href: '/reports', icon: ChartBarIcon },
  { name: 'مساعدة', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: UserGroupIcon, adminOnly: true },
]

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const isLoginPage = router.pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  if (isLoginPage) return <>{children}</>

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  const filteredNav = navigation.filter(item => 
    !item.adminOnly || session?.user?.role === 'ADMIN'
  )

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      {/* الشريط الجانبي - مخفي على الجوال ويظهر عند النقر على الأيقونة */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* رأس الشريط باللوجو */}
          <Link href="/" className="p-6 border-b dark:border-gray-700 bg-gradient-to-l from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-800 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="relative w-28 h-28 flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="الغنيمي للمحاماة" 
                width={112} 
                height={112}
                className="rounded-2xl border-4 border-indigo-100 dark:border-indigo-800 shadow-xl object-cover"
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-indigo-600/20 to-transparent pointer-events-none"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-800 to-indigo-600 dark:from-indigo-300 dark:to-indigo-100 bg-clip-text text-transparent">
                الغنيمي للمحاماة
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 tracking-wide">El-Ghoneimy Legal Consultancy</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-medium">مكتب محاماة واستشارات قانونية</p>
            </div>
          </Link>
          
          {/* زر إغلاق القائمة للجوال */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 left-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* قائمة التنقل */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* زر تسجيل الخروج */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

          {/* زر تبديل الوضع ومعلومات الاتصال */}
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="w-5 h-5" />
                  <span>الوضع الليلي</span>
                </>
              ) : (
                <>
                  <SunIcon className="w-5 h-5" />
                  <span>الوضع النهاري</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <PhoneIcon className="w-4 h-4" />
              <span dir="ltr">01126118276 - 01003651199</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPinIcon className="w-4 h-4" />
              <span>6 أكتوبر - الحجاز مول - أمام الحصري</span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* زر فتح القائمة للجوال */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-40 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* إضافة مساحة فارغة في الأعلى للجوال */}
        <div className="lg:hidden h-12"></div>
        
        {children}
      </div>
    </div>
  )
}
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      {/* ✅ أضف السطور دي */}
      <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>

      <SessionProvider session={session}>
        <ThemeProvider>
          <Toaster position="top-left" reverseOrder={false} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </SessionProvider>
    </>
  )
}
export default MyApp