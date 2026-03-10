import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarIcon, ChevronLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [filteredSessions, setFilteredSessions] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = () => {
    fetch("/api/sessions")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        setSessions(sorted)
        setFilteredSessions(sorted.filter((s: any) => new Date(s.date) >= new Date()))
      })
      .catch(() => toast.error('حدث خطأ في تحميل الجلسات'))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('تم حذف الجلسة بنجاح')
        fetchSessions() // إعادة تحميل القائمة
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ أثناء الحذف')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  const filterByDate = (date: string) => {
    if (!date) {
      setFilteredSessions(sessions.filter((s: any) => new Date(s.date) >= new Date()))
      setShowCalendar(false)
      return
    }
    const selected = new Date(date)
    const filtered = sessions.filter((s: any) => {
      const sessionDate = new Date(s.date)
      return sessionDate.toDateString() === selected.toDateString()
    })
    setFilteredSessions(filtered)
    setShowCalendar(false)
  }

  const clearFilter = () => {
    setSelectedDate('')
    setFilteredSessions(sessions.filter((s: any) => new Date(s.date) >= new Date()))
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 dark:border-amber-400"></div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الجلسات</h1>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
            {filteredSessions.length} جلسة
          </span>
        </div>
        <Link
          href="/sessions/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>إضافة جلسة</span>
        </Link>
      </div>

      {/* شريط الفلترة */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث عن جلسة..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
            />
            <CalendarIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="hidden sm:inline">بحث بيوم</span>
            </button>
            {selectedDate && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              >
                عرض الكل
              </button>
            )}
          </div>
        </div>

        {showCalendar && (
          <div className="mt-4 p-4 border-t dark:border-gray-700">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                filterByDate(e.target.value)
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* قائمة الجلسات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد جلسات</p>
            {selectedDate ? (
              <button onClick={clearFilter} className="text-amber-600 dark:text-amber-400 hover:underline">
                عرض جميع الجلسات
              </button>
            ) : (
              <Link href="/sessions/new" className="text-amber-600 dark:text-amber-400 hover:underline">
                أضف أول جلسة الآن
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {filteredSessions.map((session: any) => {
              const sessionDate = new Date(session.date)
              return (
                <li key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="p-4 flex items-center justify-between">
                    <Link href={`/cases/${session.caseId}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {session.case?.caseNumber} - {session.case?.client?.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sessionDate.toLocaleDateString('ar-EG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2"
                      title="حذف"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}