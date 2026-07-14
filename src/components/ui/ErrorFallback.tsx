export function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">משהו השתבש</h1>
      <p className="max-w-sm text-sm text-gray-500">
        אירעה שגיאה בלתי צפויה. הצוות שלנו קיבל התראה. נסה לרענן את הדף.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        רענון הדף
      </button>
    </div>
  );
}
