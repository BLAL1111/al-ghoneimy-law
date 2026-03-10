import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { UsersIcon, BriefcaseIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ClientDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [client, setClient] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (id) {
      fetch(`/api/clients/${id}`)
        .then(res => res.json())
        .then(data => {
          setClient(data)
          reset(data)
        })
        .catch(() => toast.error("حدث خطأ في تحميل البيانات"))
    }
  }, [id, reset])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم تحديث بيانات العميل بنجاح')
        setIsEditing(false)
        fetch(`/api/clients/${id}`)
          .then(res => res.json())
          .then(setClient)
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ أثناء التحديث')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === "loading" || !client) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            ملف العميل: {client.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            {isEditing ? "إلغاء" : "تعديل"}
          </button>
          <Link
            href="/clients"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
            عودة
          </Link>
        </div>
      </div>

      {/* نموذج التعديل أو عرض التفاصيل */}
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الاسم</label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم الهاتف</label>
            <input
              {...register("phone")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">العنوان</label>
            <input
              {...register("address")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            حفظ التعديلات
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white" dir="ltr">
                {client.phone || "غير محدد"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {client.email || "غير محدد"}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">العنوان</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {client.address || "غير محدد"}
              </dd>
            </div>
          </dl>

          {/* معلومات الإنشاء والتحديث - تظهر للمدير فقط */}
          {session?.user?.role === 'ADMIN' && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">معلومات السجل</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {client.createdBy && (
                  <p>أنشئ بواسطة: <span className="font-medium text-gray-800 dark:text-gray-200">{client.createdBy.name} ({client.createdBy.email})</span></p>
                )}
                {client.updatedBy && (
                  <p>آخر تحديث بواسطة: <span className="font-medium text-gray-800 dark:text-gray-200">{client.updatedBy.name} ({client.updatedBy.email})</span> في {new Date(client.updatedAt).toLocaleDateString('ar-EG')}</p>
                )}
                {!client.createdBy && !client.updatedBy && (
                  <p className="text-gray-500">لا توجد معلومات متاحة</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* قضايا العميل */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          <BriefcaseIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          قضايا العميل
        </h2>
        {client.cases?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد قضايا لهذا العميل.</p>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {client.cases?.map((c: any) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{c.caseNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{c.subject}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    c.status === "OPEN" 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {c.status === "OPEN" ? "مفتوحة" : "مغلقة"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}