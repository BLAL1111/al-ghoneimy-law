import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import {
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline"

interface Transaction {
  id: string
  date: string
  description: string
  debit: number
  credit: number
  notes?: string
  createdBy?: { name: string }
}

export default function FinancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/")
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchTransactions()
    }
  }, [status, session])

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/finance")
      if (res.ok) setTransactions(await res.json())
    } catch (error) {
      toast.error("فشل تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const url = editingId ? `/api/finance/${editingId}` : "/api/finance"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success(editingId ? "تم التعديل بنجاح" : "تم الإضافة بنجاح")
        reset()
        setShowForm(false)
        setEditingId(null)
        fetchTransactions()
      } else {
        const err = await res.json()
        toast.error(err.error || "حدث خطأ")
      }
    } catch {
      toast.error("فشل الاتصال بالخادم")
    }
  }

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id)
    setValue("date", t.date.split("T")[0])
    setValue("description", t.description)
    setValue("debit", t.debit || "")
    setValue("credit", t.credit || "")
    setValue("notes", t.notes || "")
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return
    try {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("تم الحذف")
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch {
      toast.error("فشل الحذف")
    }
  }

  const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0)
  const totalDebit = transactions.reduce((s, t) => s + (t.debit || 0), 0)
  const totalBalance = totalCredit - totalDebit

  let runningBalance = 0
  const rows = transactions.map(t => {
    runningBalance += (t.credit || 0) - (t.debit || 0)
    return { ...t, runningBalance }
  })

  if (status === "loading" || loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <BanknotesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">النظام المالي</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); reset() }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>إضافة قيد</span>
        </button>
      </div>

      {/* ملخص الأرقام */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">إجمالي الدائن (الإيرادات)</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalCredit.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">إجمالي المدين (المصروفات)</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalDebit.toLocaleString()} ج.م</p>
        </div>
        <div className={`${totalBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'} border rounded-xl p-4 text-center`}>
          <p className={`text-sm mb-1 ${totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>الرصيد الحالي</p>
          <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>{totalBalance.toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            {editingId ? "تعديل القيد" : "إضافة قيد جديد"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">التاريخ *</label>
              <input type="date" {...register("date", { required: "التاريخ مطلوب" })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">البيان *</label>
              <input {...register("description", { required: "البيان مطلوب" })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="وصف العملية" />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">مدين (مصروف)</label>
              <input type="number" step="0.01" {...register("debit")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0" dir="ltr" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">دائن (إيراد)</label>
              <input type="number" step="0.01" {...register("credit")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ملاحظات</label>
              <input {...register("notes")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ملاحظات إضافية" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                <CheckIcon className="w-5 h-5" />
                <span>{editingId ? "حفظ التعديل" : "إضافة"}</span>
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); reset() }}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5" />
                <span>إلغاء</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول كشف الحساب */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">كشف الحساب</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold">#</th>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold">البيان</th>
                <th className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">مدين</th>
                <th className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">دائن</th>
                <th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-semibold">الرصيد</th>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد قيود مالية بعد
                  </td>
                </tr>
              ) : (
                rows.map((t, i) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200" dir="ltr">
                      {new Date(t.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      <div>{t.description}</div>
                      {t.notes && <div className="text-xs text-gray-400">{t.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">
                      {t.debit ? t.debit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                      {t.credit ? t.credit.toLocaleString() : '-'}
                    </td>
                    <td className={`px-4 py-3 font-bold ${t.runningBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {t.runningBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(t)}
                          className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-500">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-bold text-gray-800 dark:text-white">الإجمالي</td>
                  <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">{totalDebit.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">{totalCredit.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-bold text-lg ${totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {totalBalance.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
