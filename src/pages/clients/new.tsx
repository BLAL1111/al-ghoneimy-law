import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { UsersIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function NewClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم إضافة العميل بنجاح')
        router.push("/clients")
      } else {
        toast.error('حدث خطأ أثناء الإضافة')
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
          <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة عميل جديد</h1>
      </div>

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {/* الاسم */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الاسم الكامل *</label>
          <input
            {...register("name", { required: "الاسم مطلوب" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل اسم العميل"
          />
          {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message as string}</p>}
        </div>

        {/* رقم الهاتف */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم الهاتف</label>
          <input
            {...register("phone")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل رقم الهاتف"
            dir="ltr"
          />
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            {...register("email")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="example@domain.com"
            dir="ltr"
          />
        </div>

        {/* العنوان */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">العنوان</label>
          <input
            {...register("address")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل العنوان"
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
            onClick={() => router.push('/clients')}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}