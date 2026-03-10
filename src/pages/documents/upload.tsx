import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function UploadDocument() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { caseId } = router.query
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cases, setCases] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // جلب قائمة القضايا لربط المستند بها
  useEffect(() => {
    fetch("/api/cases")
      .then(res => res.json())
      .then(setCases)
  }, [])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف أولاً')
      return
    }
    if (!caseId) {
      toast.error('الرجاء اختيار القضية')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("caseId", caseId as string)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success('تم رفع المستند بنجاح')
        router.push(`/cases/${caseId}`)
      } else {
        toast.error('فشل رفع الملف')
        setUploading(false)
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  })

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
          <DocumentArrowUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">رفع مستند جديد</h1>
      </div>

      {/* اختيار القضية */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">القضية المرتبطة</label>
        <select
          value={caseId || ''}
          onChange={(e) => router.push(`/documents/upload?caseId=${e.target.value}`)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
        >
          <option value="">اختر قضية</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} - {c.client?.name}
            </option>
          ))}
        </select>
      </div>

      {/* منطقة رفع الملفات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
              }`}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            {isDragActive ? (
              <p className="text-purple-600 dark:text-purple-400">أفلت الملف هنا...</p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-1">اسحب وأفلت ملفاً هنا، أو انقر لاختيار ملف</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">PDF, DOC, DOCX, PNG, JPG (Max 10MB)</p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-xl p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DocumentArrowUpIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* زر الرفع */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !caseId || uploading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'جاري الرفع...' : 'رفع المستند'}
      </button>
    </div>
  )
}