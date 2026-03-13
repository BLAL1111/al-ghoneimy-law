import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BriefcaseIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CasesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cases, setCases] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => { fetchCases() }, [])

  const fetchCases = () => {
    fetch("/api/cases").then(res => res.json()).then(setCases)
      .catch(() => toast.error('حدث خطأ في تحميل القضايا'))
  }

  const handleDelete = async (id: string, caseNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف القضية رقم ${caseNumber}؟`)) return
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) { toast.success('تم حذف القضية'); fetchCases() }
      else toast.error('حدث خطأ أثناء الحذف')
    } catch { toast.error('فشل الاتصال بالخادم') }
  }

  const filtered = (cases as any[]).filter(c => {
    const matchSearch = !search || c.caseNumber?.includes(search) || c.client?.name?.includes(search) || c.subject?.includes(search)
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <BriefcaseIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">القضايا</h1>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{filtered.length}</span>
        </div>
        <Link href="/cases/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm">
          <span className="text-base leading-none">+</span>
          <span>إضافة قضية</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="ابحث برقم القضية أو العميل..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white">
          <option value="ALL">كل الحالات</option>
          <option value="OPEN">مفتوحة</option>
          <option value="CLOSED">مغلقة</option>
        </select>
      </div>

      {/* Table - desktop / Cards - mobile */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center py-12">
          <BriefcaseIcon className="w-14 h-14 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-3">لا توجد قضايا</p>
          <Link href="/cases/new" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">أضف أول قضية</Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px]">
                <thead className="bg-gray-50 dark:bg-gray-700/60 text-xs">
                  <tr>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">رقم القضية</th>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">الموضوع</th>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">العميل</th>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">المحكمة</th>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filtered.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="p-3 font-semibold text-gray-900 dark:text-white text-sm">{c.caseNumber}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 text-sm max-w-[160px] truncate">{c.subject || '—'}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">{c.client?.name || '—'}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 text-sm max-w-[120px] truncate">{c.court || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "OPEN" ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {c.status === "OPEN" ? "مفتوحة" : "مغلقة"}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-3">
                        <Link href={`/cases/${c.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">عرض</Link>
                        <button onClick={() => handleDelete(c.id, c.caseNumber)} className="text-red-500 hover:text-red-700 dark:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{c.caseNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "OPEN" ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {c.status === "OPEN" ? "مفتوحة" : "مغلقة"}
                      </span>
                    </div>
                    {c.subject && <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 truncate">{c.subject}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      {c.client?.name && <span>👤 {c.client.name}</span>}
                      {c.court && <span>🏛️ {c.court}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/cases/${c.id}`} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                      عرض
                    </Link>
                    <button onClick={() => handleDelete(c.id, c.caseNumber)} className="text-red-400 hover:text-red-600 p-1">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}