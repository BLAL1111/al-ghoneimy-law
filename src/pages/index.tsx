import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BriefcaseIcon, UsersIcon, CalendarIcon, DocumentTextIcon,
  ScaleIcon, BellAlertIcon, ClockIcon, ChevronLeftIcon, SparklesIcon
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
        fetch("/api/cases").then(r => r.json()),
        fetch("/api/clients").then(r => r.json()),
        fetch("/api/sessions").then(r => r.json()),
        fetch("/api/documents/count").then(r => r.json()).catch(() => ({ count: 0 })),
      ]).then(([cases, clients, sessions, docs]) => {
        setStats({ cases: cases.length, clients: clients.length, sessions: sessions.length, documents: docs.count || 0 })
        const upcoming = sessions
          .filter((s: any) => new Date(s.date) >= new Date())
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setRecentSessions(upcoming.slice(0, 5))
      }).catch(() => {})
    }
  }, [status])

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  const cards = [
    { name: 'القضايا', value: stats.cases, icon: BriefcaseIcon, href: '/cases', color: 'bg-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' },
    { name: 'العملاء', value: stats.clients, icon: UsersIcon, href: '/clients', color: 'bg-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' },
    { name: 'الجلسات', value: stats.sessions, icon: CalendarIcon, href: '/sessions', color: 'bg-amber-600', light: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
    { name: 'المستندات', value: stats.documents, icon: DocumentTextIcon, href: '/documents', color: 'bg-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
  ]

  const quickActions = [
    { label: '+ قضية', href: '/cases/new', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: '+ عميل', href: '/clients/new', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ جلسة', href: '/sessions/new', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: '+ مستند', href: '/documents/upload', color: 'bg-purple-600 hover:bg-purple-700' },
  ]

  return (
    <div className="space-y-4" dir="rtl">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 dark:from-indigo-800 dark:to-indigo-950 text-white rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <ScaleIcon className="w-7 h-7 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold truncate">مكتب الغنيمي للمحاماة</h1>
            <p className="text-indigo-200 text-sm">مرحباً بعودتك، {session?.user?.name}</p>
          </div>
        </div>
        <p className="mt-2 text-indigo-200 text-xs lg:text-sm">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link key={card.name} href={card.href}>
            <div className={`${card.light} rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between border cursor-pointer`}>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{card.name}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">{card.value}</p>
              </div>
              <div className={`${card.color} p-2 lg:p-3 rounded-xl text-white shadow`}>
                <card.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {quickActions.map(a => (
          <Link key={a.href} href={a.href} className={`${a.color} text-white rounded-xl py-3 px-4 text-center text-sm font-medium transition shadow-sm`}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm lg:text-base">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            الجلسات القادمة
          </h2>
          <Link href="/sessions" className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline flex items-center gap-1">
            عرض الكل <ChevronLeftIcon className="w-3 h-3" />
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <BellAlertIcon className="w-10 h-10 mx-auto text-gray-200 dark:text-gray-700 mb-2" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">لا توجد جلسات قادمة</p>
          </div>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {recentSessions.map((s: any) => {
              const d = new Date(s.date)
              return (
                <li key={s.id} className="p-3 lg:p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg flex-shrink-0">
                      <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                        {s.case?.caseNumber} — {s.case?.client?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {d.toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Link href={`/cases/${s.caseId}`} className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline flex-shrink-0 ml-2">
                    عرض
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {/* مساعد ذكي (قريباً) */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg flex-shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">مساعد قانوني ذكي قادم قريباً لتحليل المستندات وصياغة المذكرات القانونية.</p>
        </div>
      </div>
    </div>
  )
}