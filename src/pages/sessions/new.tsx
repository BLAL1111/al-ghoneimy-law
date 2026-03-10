import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function NewSession() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // جلب قائمة القضايا لربط الجلسة بها
  useEffect(() => {
    fetch("/api/cases")
      .then(res => res.json())
      .then(setCases)
  }, [])

  // إذا كان هناك caseId في الـ URL (عند الدخول من صفحة قضية محددة)
  useEffect(() => {
    if (router.query.caseId) {
      setValue("caseId", router.query.caseId)
    }
  }, [router.query.caseId, setValue])

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم إضافة الجلسة بنجاح')
        router.push("/sessions")
      } else {
        toast.error('حدث خطأ أثناء الإضافة')
      }
    } catch (error) {
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
    <div className="max-w-2xl mx-auto">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
          <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة جلسة جديدة</h1>
      </div>

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {/* اختيار القضية */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">القضية *</label>
          <select
            {...register("caseId", { required: "يجب اختيار قضية" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
          >
            <option value="">اختر قضية</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.client?.name}
              </option>
            ))}
          </select>
          {errors.caseId && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.caseId.message as string}</p>}
        </div>

        {/* تاريخ الجلسة */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">تاريخ الجلسة *</label>
          <input
            type="datetime-local"
            {...register("date", { required: "تاريخ الجلسة مطلوب" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
          />
          {errors.date && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message as string}</p>}
        </div>

        {/* ملاحظات */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">ملاحظات</label>
          <textarea
            {...register("notes")}
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/sessions')}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}