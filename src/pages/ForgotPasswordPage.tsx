import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export function ForgotPasswordPage() {
  const { session, loading } = useAuth();

  if (!loading && session) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">איפוס סיסמה</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          הזן/י את כתובת האימייל שלך ונשלח קישור לאיפוס הסיסמה
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            חזרה להתחברות
          </Link>
        </p>
      </div>
    </div>
  );
}
