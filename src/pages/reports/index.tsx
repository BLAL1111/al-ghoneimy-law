import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/cases").then(res => res.json()),
        fetch("/api/clients").then(res => res.json()),
      ]).then(([cases, clients]) => {
        const openCases = cases.filter((c: any) => c.status === "OPEN").length
        const closedCases = cases.length - openCases
        setData({
          totalCases: cases.length,
          openCases,
          closedCases,
          totalClients: clients.length,
        })
      })
    }
  }, [status])

  if (status === "loading" || !data) return <div className="text-center p-8 dark:text-white">جاري التحميل...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">التقارير</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
            <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ملخص القضايا
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>إجمالي القضايا:</span>
              <span className="font-bold">{data.totalCases}</span>
            </div>
            <div className="flex justify-between">
              <span>قضايا مفتوحة:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{data.openCases}</span>
            </div>
            <div className="flex justify-between">
              <span>قضايا مغلقة:</span>
              <span className="font-bold text-gray-600 dark:text-gray-400">{data.closedCases}</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
            <UsersIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            العملاء
          </h2>
          <p className="text-gray-600 dark:text-gray-300">إجمالي العملاء: <span className="font-bold">{data.totalClients}</span></p>
        </div>
      </div>
    </div>
  )
}