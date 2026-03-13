import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { UsersIcon, TrashIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => { fetchClients() }, [])

  const fetchClients = () => {
    fetch("/api/clients").then(res => res.json()).then(setClients)
      .catch(() => toast.error('حدث خطأ في تحميل العملاء'))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل ${name}؟`)) return
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) { toast.success('تم حذف العميل'); fetchClients() }
      else toast.error('حدث خطأ أثناء الحذف')
    } catch { toast.error('فشل الاتصال بالخادم') }
  }

  const filtered = (clients as any[]).filter(c =>
    !search || c.name?.includes(search) || c.phone?.includes(search) || c.email?.includes(search)
  )

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
    </div>
  )

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
            <UsersIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">العملاء</h1>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{filtered.length}</span>
        </div>
        <Link href="/clients/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm">
          <span className="text-base leading-none">+</span>
          <span>إضافة عميل</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="ابحث بالاسم أو الهاتف أو البريد..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-gray-700 dark:text-white" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center py-12">
          <UsersIcon className="w-14 h-14 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-3">لا يوجد عملاء</p>
          <Link href="/clients/new" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">أضف أول عميل</Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/60 text-xs">
                <tr>
                  <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">الاسم</th>
                  <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">الهاتف</th>
                  <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">البريد الإلكتروني</th>
                  <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">القضايا</th>
                  <th className="p-3 text-right font-semibold text-gray-500 dark:text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="p-3 font-semibold text-gray-900 dark:text-white text-sm">{c.name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 text-sm" dir="ltr">{c.phone || '—'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{c.email || '—'}</td>
                    <td className="p-3">
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-medium">
                        {c.cases?.length || 0}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-3">
                      <Link href={`/clients/${c.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">عرض</Link>
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:text-red-700 dark:text-red-400">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</p>
                    <div className="mt-1.5 space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <PhoneIcon className="w-3 h-3" />
                          <span dir="ltr">{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <EnvelopeIcon className="w-3 h-3" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">
                        {c.cases?.length || 0} قضايا
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/clients/${c.id}`} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                      عرض
                    </Link>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-red-400 hover:text-red-600 p-1">
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
