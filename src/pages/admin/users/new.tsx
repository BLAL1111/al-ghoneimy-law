import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export default function NewUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user?.role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم إضافة المستخدم بنجاح')
        router.push('/admin/users')
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === 'loading') return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <UserPlusIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة مستخدم جديد</h1>
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

        {/* كلمة المرور */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">كلمة المرور</label>
          <input
            type="password"
            {...register('password', { 
              required: 'كلمة المرور مطلوبة', 
              minLength: { value: 6, message: 'يجب أن تكون 6 أحرف على الأقل' } 
            })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="********"
            dir="ltr"
          />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{String(errors.password.message)}</p>}
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
            <option value="ACCOUNTANT">محاسب</option>
            <option value="TRAINEE">متدرب</option>
          </select>
        </div>

        {/* زر الحفظ */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            حفظ
          </button>
        </div>
      </form>
    </div>
  )
}