function SimpleApp() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Quiz Management System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          React + TypeScript + Tailwind + Vite
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Admin Panel
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">
            Take Quiz
          </button>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          Status: Application running successfully! ✅
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;