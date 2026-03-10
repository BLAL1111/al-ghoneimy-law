import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = () => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(setDocuments)
      .catch(() => toast.error('حدث خطأ في تحميل المستندات'))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستند ${name}؟`)) return

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('تم حذف المستند بنجاح')
        fetchDocuments()
      } else {
        const error = await res.json()
        toast.error(error.error || 'حدث خطأ أثناء الحذف')
      }
    } catch {
      toast.error('فشل الاتصال بالخادم')
    }
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المستندات</h1>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
            {documents.length} مستند
          </span>
        </div>
        <Link
          href="/documents/upload"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>رفع مستند</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الملف</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">القضية</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">تاريخ الرفع</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {documents.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {doc.name}
                </td>
                <td className="p-3 text-gray-800 dark:text-gray-200">{doc.case?.caseNumber || "غير مرتبط"}</td>
                <td className="p-3 text-gray-800 dark:text-gray-200">
                  {new Date(doc.uploadedAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="p-3">
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium ml-3"
                  >
                    عرض
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}