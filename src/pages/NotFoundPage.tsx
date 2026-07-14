import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">הדף לא נמצא</h1>
      <Link to="/leads" className="text-blue-600 hover:underline">
        חזרה לדף הלידים
      </Link>
    </div>
  );
}
