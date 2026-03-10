import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { 
  QuestionMarkCircleIcon,
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  ScaleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function HelpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  if (status === "loading") return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-800 dark:to-indigo-950 text-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <QuestionMarkCircleIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">مرحباً بك في نظام الغنيمي للمحاماة</h1>
            <p className="text-indigo-100 mt-2">دليل الاستخدام الشامل للمنصة القانونية الذكية</p>
          </div>
        </div>
      </div>

      {/* بطاقات الميزات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">إدارة القضايا</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3">تتبع جميع القضايا مع إمكانية إضافة:</p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">• الوقائع والمستندات</li>
            <li className="flex items-center gap-2">• جدولة الجلسات والمواعيد</li>
            <li className="flex items-center gap-2">• المذكرات والطلبات</li>
            <li className="flex items-center gap-2">• تنبيهات ذكية قبل الجلسات</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">العملاء</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3">إدارة متكاملة للعملاء:</p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">• صفحة خاصة لكل عميل</li>
            <li className="flex items-center gap-2">• متابعة قضاياه ومستنداته</li>
            <li className="flex items-center gap-2">• سجل الجلسات والفواتير</li>
            <li className="flex items-center gap-2">• إشعارات تلقائية للعميل</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">الجلسات</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3">تنظيم المواعيد والجلسات:</p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">• تقويم تفاعلي</li>
            <li className="flex items-center gap-2">• تذكيرات قبل الموعد</li>
            <li className="flex items-center gap-2">• ربط الجلسات بالقضايا</li>
            <li className="flex items-center gap-2">• عرض الجلسات القادمة</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">المستندات</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3">إدارة الملفات والمستندات:</p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">• رفع وتصنيف المستندات</li>
            <li className="flex items-center gap-2">• عرض سريع للملفات</li>
            <li className="flex items-center gap-2">• ربط المستندات بالقضايا</li>
            <li className="flex items-center gap-2">• مشاركة آمنة مع العملاء</li>
          </ul>
        </div>
      </div>

      {/* قسم كيفية البدء */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <RocketLaunchIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">كيف تبدأ باستخدام النظام؟</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">1</div>
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">أضف عملاءك</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">ابدأ بإضافة بيانات العملاء من صفحة "العملاء"</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">2</div>
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">سجل القضايا</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">أضف القضايا واربطها بالعملاء</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">3</div>
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">نظم الجلسات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">حدد مواعيد الجلسات والمذكرات</p>
          </div>
        </div>
      </div>

      {/* معلومات الاتصال */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ScaleIcon className="w-6 h-6" />
          تواصل معنا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <PhoneIcon className="w-5 h-5 text-gray-300" />
            <div>
              <p className="text-sm text-gray-300">اتصل بنا</p>
              <p className="font-bold" dir="ltr">01126118276 - 01003651199</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-gray-300" />
            <div>
              <p className="text-sm text-gray-300">الموقع</p>
              <p>6 أكتوبر - الحجاز مول - أمام الحصري</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-300" />
            <div>
              <p className="text-sm text-gray-300">البريد الإلكتروني</p>
              <p>info@elghoneimy.eg</p>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الذكاء الاصطناعي */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-full">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">مساعد قانوني ذكي (قريباً)</h2>
            <p className="text-indigo-600 dark:text-indigo-400">قريباً سيتم إضافة مساعد ذكي لتحليل المستندات وصياغة المذكرات القانونية.</p>
          </div>
        </div>
      </div>
    </div>
  )
}