import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PencilIcon } from '@heroicons/react/24/outline'

export default function EditUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user?.role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/users/${id}`)
        .then(res => res.json())
        .then(data => {
          reset(data)
          setLoading(false)
        })
        .catch(() => toast.error('خطأ في تحميل البيانات'))
    }
  }, [id, reset])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم التحديث')
        router.push('/admin/users')
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('فشل الاتصال')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <PencilIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تعديل المستخدم</h1>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        {/* الاسم */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الاسم</label>
          <input
            {...register('name', { required: 'الاسم مطلوب' })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل الاسم"
          />
          {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{String(errors.name.message)}</p>}
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            {...register('email', { required: 'البريد مطلوب' })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="example@domain.com"
            dir="ltr"
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{String(errors.email.message)}</p>}
        </div>

        {/* كلمة المرور - مع النص الإضافي */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            {...register('password')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="********"
            dir="ltr"
          />
        </div>

        {/* الدور */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الدور</label>
          <select
            {...register('role')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
          >
            <option value="LAWYER">محامي</option>
            <option value="ADMIN">مدير</option>
          </select>
        </div>

        {/* زر التحديث */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            تحديث
          </button>
        </div>
      </form>
    </div>
  )
}
