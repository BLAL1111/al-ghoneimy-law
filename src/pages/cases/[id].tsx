import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { BriefcaseIcon, CalendarIcon, DocumentTextIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CaseDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [caseData, setCaseData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (id) {
      fetch(`/api/cases/${id}`)
        .then(res => res.json())
        .then(data => {
          setCaseData(data)
          reset(data)
        })
        .catch(() => toast.error("حدث خطأ في تحميل البيانات"))
    }
  }, [id, reset])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('تم تحديث القضية بنجاح')
        setIsEditing(false)
        // إعادة تحميل البيانات
        fetch(`/api/cases/${id}`)
          .then(res => res.json())
          .then(setCaseData)
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ أثناء التحديث')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === "loading" || !caseData) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* رأس الصفحة مع عنوان القضية */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <BriefcaseIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            قضية رقم: {caseData.caseNumber}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            caseData.status === "OPEN" 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {caseData.status === "OPEN" ? "مفتوحة" : "مغلقة"}
          </span>
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
            href="/cases"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم القضية</label>
              <input
                {...register("caseNumber")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">المحكمة</label>
              <input
                {...register("court")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الموضوع</label>
              <input
                {...register("subject")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الحالة</label>
              <select
                {...register("status")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              >
                <option value="OPEN">مفتوحة</option>
                <option value="CLOSED">مغلقة</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">تاريخ القيد</label>
              <input
                type="date"
                {...register("filedDate")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الوصف</label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
              <dt className="text-sm text-gray-500 dark:text-gray-400">العميل</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">{caseData.client?.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">المحكمة</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">{caseData.court || "غير محدد"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">الموضوع</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">{caseData.subject || "غير محدد"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">تاريخ القيد</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {caseData.filedDate ? new Date(caseData.filedDate).toLocaleDateString('ar-EG') : "غير محدد"}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">الوصف</dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">{caseData.description || "لا يوجد وصف"}</dd>
            </div>
          </dl>

          {/* معلومات الإنشاء والتحديث - تظهر للمدير فقط */}
          {session?.user?.role === 'ADMIN' && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">معلومات السجل</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {caseData.createdBy && (
                  <p>أنشئ بواسطة: <span className="font-medium text-gray-800 dark:text-gray-200">{caseData.createdBy.name} ({caseData.createdBy.email})</span></p>
                )}
                {caseData.updatedBy && (
                  <p>آخر تحديث بواسطة: <span className="font-medium text-gray-800 dark:text-gray-200">{caseData.updatedBy.name} ({caseData.updatedBy.email})</span> في {new Date(caseData.updatedAt).toLocaleDateString('ar-EG')}</p>
                )}
                {!caseData.createdBy && !caseData.updatedBy && (
                  <p className="text-gray-500">لا توجد معلومات متاحة</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* قائمة الجلسات */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            الجلسات
          </h2>
          <Link
            href={`/sessions/new?caseId=${id}`}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + إضافة جلسة
          </Link>
        </div>
        {caseData.sessions?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد جلسات مسجلة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {caseData.sessions?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-800 dark:text-gray-200">
                      {new Date(s.date).toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-gray-200">{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* قائمة المستندات */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            المستندات
          </h2>
          <Link
            href={`/documents/upload?caseId=${id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + رفع مستند
          </Link>
        </div>
        {caseData.documents?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد مستندات مرفوعة.</p>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {caseData.documents?.map((d: any) => (
              <li key={d.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-800 dark:text-white">{d.name}</span>
                </div>
                <a
                  href={d.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  عرض
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}