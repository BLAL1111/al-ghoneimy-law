import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UsersIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user?.role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(() => toast.error('حدث خطأ في تحميل المستخدمين'))
  }, [])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم ${email}؟`)) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم الحذف بنجاح')
        setUsers(users.filter((u: any) => u.id !== id))
      } else {
        const data = await res.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === 'loading') return <div className="p-8 text-center">جاري التحميل...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة المستخدمين</h1>
        <Link 
          href="/admin/users/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إضافة مستخدم جديد
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-right text-gray-600 dark:text-gray-300">الاسم</th>
              <th className="p-3 text-right text-gray-600 dark:text-gray-300">البريد</th>
              <th className="p-3 text-right text-gray-600 dark:text-gray-300">الدور</th>
              <th className="p-3 text-right text-gray-600 dark:text-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 text-gray-800 dark:text-white">{u.name}</td>
                <td className="p-3 text-gray-800 dark:text-white">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {u.role === 'ADMIN' ? 'مدير' : u.role === 'ACCOUNTANT' ? 'محاسب' : u.role === 'TRAINEE' ? 'متدرب' : 'محامي'}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/users/${u.id}`} className="text-indigo-600 hover:text-indigo-800 ml-2">
                    <PencilIcon className="w-5 h-5 inline" />
                  </Link>
                  <button onClick={() => handleDelete(u.id, u.email)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}