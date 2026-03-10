import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { UsersIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = () => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(setClients)
      .catch(() => toast.error('حدث خطأ في تحميل العملاء'))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل ${name}؟`)) return

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('تم حذف العميل بنجاح')
        fetchClients()
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ أثناء الحذف')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">العملاء</h1>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
            {clients.length} عميل
          </span>
        </div>
        <Link href="/clients/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span>+</span>
          <span>إضافة عميل جديد</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الاسم</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الهاتف</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">البريد</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">العنوان</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {clients.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                <td className="p-3 text-gray-800 dark:text-gray-200" dir="ltr">{c.phone || '—'}</td>
                <td className="p-3 text-gray-800 dark:text-gray-200">{c.email || '—'}</td>
                <td className="p-3 text-gray-800 dark:text-gray-200">{c.address || '—'}</td>
                <td className="p-3">
                  <Link href={`/clients/${c.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium ml-3">
                    عرض
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}