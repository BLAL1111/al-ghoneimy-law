import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BriefcaseIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function NewCase() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(setClients)
  }, [])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // إضافة هذا السطر
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم إضافة القضية بنجاح')
        router.push("/cases")
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch (error) {
      toast.error('فشل الاتصال بالخادم')
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
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <BriefcaseIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة قضية جديدة</h1>
      </div>

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {/* رقم القضية */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم القضية *</label>
          <input
            {...register("caseNumber", { required: "رقم القضية مطلوب" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل رقم القضية"
          />
          {errors.caseNumber && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.caseNumber.message as string}</p>}
        </div>

        {/* العميل */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">العميل *</label>
          <select
            {...register("clientId", { required: "يجب اختيار عميل" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
          >
            <option value="">اختر عميلاً</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.clientId.message as string}</p>}
        </div>

        {/* المحكمة */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">المحكمة</label>
          <input
            {...register("court")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="اسم المحكمة"
          />
        </div>

        {/* الموضوع */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الموضوع</label>
          <input
            {...register("subject")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="موضوع القضية"
          />
        </div>

        {/* تاريخ القيد */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">تاريخ القيد</label>
          <input
            type="date"
            {...register("filedDate")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الوصف</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="تفاصيل القضية"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => router.push('/cases')}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}