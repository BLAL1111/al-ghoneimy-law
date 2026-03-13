import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { BriefcaseIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function NewCase() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ اقتراح المحاكم
  const [courts, setCourts] = useState<string[]>([])
  const [courtInput, setCourtInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const courtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
    fetch("/api/cases/courts").then(r => r.json()).then(setCourts).catch(() => {})
  }, [])

  // إغلاق الاقتراحات لما يضغط خارجها
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (courtRef.current && !courtRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredCourts = courts.filter(c =>
    c.toLowerCase().includes(courtInput.toLowerCase()) && c !== courtInput
  )

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ ...data, court: courtInput || data.court }),
      })
      if (res.ok) {
        toast.success('تم إضافة القضية بنجاح ✅')
        router.push("/cases")
      } else {
        const err = await res.json()
        toast.error(err.error || 'حدث خطأ')
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
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
          <BriefcaseIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة قضية جديدة</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">

        {/* رقم القضية */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">رقم القضية *</label>
          <input
            {...register("caseNumber", { required: "رقم القضية مطلوب" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="أدخل رقم القضية"
          />
          {errors.caseNumber && <p className="text-red-500 text-sm mt-1">{errors.caseNumber.message as string}</p>}
        </div>

        {/* العميل */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">العميل *</label>
          <select
            {...register("clientId", { required: "يجب اختيار عميل" })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">اختر عميلاً</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId.message as string}</p>}
        </div>

        {/* ✅ المحكمة مع اقتراحات ذكية */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <BuildingLibraryIcon className="w-4 h-4 text-indigo-500" />
              المحكمة
              {courts.length > 0 && (
                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-normal">
                  ({courts.length} محكمة موجودة)
                </span>
              )}
            </span>
          </label>
          <div className="relative" ref={courtRef}>
            <input
              type="text"
              value={courtInput}
              onChange={e => {
                setCourtInput(e.target.value)
                setValue('court', e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="اكتب اسم المحكمة..."
              autoComplete="off"
            />
            <input type="hidden" {...register("court")} />

            {/* قائمة الاقتراحات */}
            {showSuggestions && filteredCourts.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
                <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  💡 اختر من المحاكم المسجّلة مسبقاً
                </p>
                {filteredCourts.map((court, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => {
                      setCourtInput(court)
                      setValue('court', court)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-800 dark:text-gray-200 text-sm transition-colors flex items-center gap-2"
                  >
                    <BuildingLibraryIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {court}
                  </button>
                ))}
              </div>
            )}

            {/* لو فيه محاكم موجودة وما في مطابقة */}
            {showSuggestions && courtInput.length > 0 && filteredCourts.length === 0 && courts.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                محكمة جديدة — ستُضاف تلقائياً للاقتراحات
              </div>
            )}
          </div>
        </div>

        {/* الموضوع */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الموضوع</label>
          <input
            {...register("subject")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="موضوع القضية"
          />
        </div>

        {/* تاريخ القيد */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">تاريخ القيد</label>
          <input
            type="date"
            {...register("filedDate")}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">الوصف</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="تفاصيل القضية"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ القضية'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/cases')}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}