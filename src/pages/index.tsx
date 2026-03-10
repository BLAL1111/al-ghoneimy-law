import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  BriefcaseIcon, 
  UsersIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  ScaleIcon,
  BellAlertIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ cases: 0, clients: 0, sessions: 0, documents: 0 })
  const [recentSessions, setRecentSessions] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/cases").then(res => res.json()),
        fetch("/api/clients").then(res => res.json()),
        fetch("/api/sessions").then(res => res.json()),
        fetch("/api/documents/count").then(res => res.json()).catch(() => ({ count: 0 })),
      ]).then(([cases, clients, sessions, docs]) => {
        setStats({
          cases: cases.length,
          clients: clients.length,
          sessions: sessions.length,
          documents: docs.count || 0,
        })
        setRecentSessions(sessions.slice(0, 5))
      }).catch(() => {})
    }
  }, [status])

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  const cards = [
    { name: 'القضايا', value: stats.cases, icon: BriefcaseIcon, href: '/cases', color: 'bg-indigo-600', bgLight: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { name: 'العملاء', value: stats.clients, icon: UsersIcon, href: '/clients', color: 'bg-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { name: 'الجلسات', value: stats.sessions, icon: CalendarIcon, href: '/sessions', color: 'bg-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-900/20' },
    { name: 'المستندات', value: stats.documents, icon: DocumentTextIcon, href: '/documents', color: 'bg-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  return (
    <div className="space-y-6">
      {/* الترحيب باسم المكتب */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 dark:from-indigo-800 dark:to-indigo-950 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3">
          <ScaleIcon className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">مكتب الغنيمي للمحاماة</h1>
            <p className="text-indigo-200 dark:text-indigo-300">مرحباً بعودتك، {session?.user?.name}</p>
          </div>
        </div>
        <p className="mt-2 text-indigo-100 dark:text-indigo-200">آخر تحديث: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.name} href={card.href}>
            <div className={`${card.bgLight} rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex items-center justify-between cursor-pointer border border-gray-100 dark:border-gray-700`}>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{card.name}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* صف الأزرار السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/cases/new" className="bg-indigo-600 text-white rounded-xl p-4 text-center hover:bg-indigo-700 transition shadow-md">
          + إضافة قضية
        </Link>
        <Link href="/clients/new" className="bg-emerald-600 text-white rounded-xl p-4 text-center hover:bg-emerald-700 transition shadow-md">
          + إضافة عميل
        </Link>
        <Link href="/sessions/new" className="bg-amber-600 text-white rounded-xl p-4 text-center hover:bg-amber-700 transition shadow-md">
          + تسجيل جلسة
        </Link>
        <Link href="/documents/upload" className="bg-purple-600 text-white rounded-xl p-4 text-center hover:bg-purple-700 transition shadow-md">
          + رفع مستند
        </Link>
      </div>

      {/* الجلسات القادمة */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            الجلسات القادمة
          </h2>
          <Link href="/sessions" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 text-sm">
            عرض الكل
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <BellAlertIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">لا توجد جلسات قادمة.</p>
          </div>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {recentSessions.map((session: any) => (
              <li key={session.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {session.case?.caseNumber} - {session.case?.client?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(session.date).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Link href={`/cases/${session.caseId}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                  عرض القضية
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* مساعد ذكي (قريباً) */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-700 dark:text-gray-300">مساعد قانوني ذكي قادم قريباً لتحليل المستندات وصياغة المذكرات القانونية.</p>
        </div>
      </div>
    </div>
  )
}