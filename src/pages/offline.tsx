export default function OfflinePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white" dir="rtl">
        <div className="text-6xl mb-6">📵</div>
        <h1 className="text-3xl font-bold mb-3">لا يوجد اتصال بالإنترنت</h1>
        <p className="text-gray-400 mb-6">تحقق من اتصالك وحاول مرة أخرى</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }
  