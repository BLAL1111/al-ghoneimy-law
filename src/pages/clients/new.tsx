import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { UsersIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function NewClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'taken' | 'available'>('idle')
  const [takenName, setTakenName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const nameValue = watch('name', '')

  // ✅ تحقق لحظي من تكرار الاسم (debounced 600ms)
  useEffect(() => {
    if (!nameValue || nameValue.trim().length < 2) {
      setNameStatus('idle')
      return
    }
    setNameStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/clients')
        const clients = await res.json()
        const normalized = nameValue.trim().replace(/\s+/g, ' ').toLowerCase()
        const found = clients.find((c: any) =>
          c.name.trim().replace(/\s+/g, ' ').toLowerCase() === normalized
        )
        if (found) {
          setNameStatus('taken')
          setTakenName(found.name)
        } else {
          setNameStatus('available')
        }
      } catch {
        setNameStatus('idle')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [nameValue])

  const onSubmit = async (data: any) => {
    if (nameStatus === 'taken') {
      toast.error('هذا الاسم مستخدم بالفعل!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم إضافة العميل بنجاح ✅')
        router.push("/clients")
      } else {
        const err = await res.json()
        toast.error(err.error || 'حدث خطأ أثناء الإضافة')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
          <UsersIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة عميل جديد</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">

        {/* الاسم مع التحقق اللحظي */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الاسم الكامل *</label>
          <div className="relative">
            <input
              {...register("name", { required: "الاسم مطلوب" })}
              className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                nameStatus === 'taken'
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                  : nameStatus === 'available'
                  ? 'border-green-400 dark:border-green-500 focus:ring-green-400'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
              }`}
              placeholder="أدخل اسم العميل"
            />
            {/* أيقونة الحالة */}
            <div className="absolute left-3 top-2.5">
              {nameStatus === 'checking' && (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              )}
              {nameStatus === 'taken' && (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              )}
              {nameStatus === 'available' && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          {/* رسائل الحالة */}
          {nameStatus === 'taken' && (
            <div className="mt-1.5 flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              <span>يوجد عميل بنفس الاسم: <strong>"{takenName}"</strong></span>
            </div>
          )}
          {nameStatus === 'available' && (
            <p className="mt-1.5 text-green-600 dark:text-green-400 text-sm flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4" />
              الاسم متاح ✓
            </p>
          )}
          {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message as string}</p>}
        </div>

        {/* رقم الهاتف */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم الهاتف</label>
          <input
            {...register("phone")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            {...register("email")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="example@domain.com"
            dir="ltr"
          />
        </div>

        {/* العنوان */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">العنوان</label>
          <input
            {...register("address")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل العنوان"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || nameStatus === 'taken' || nameStatus === 'checking'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/clients')}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}