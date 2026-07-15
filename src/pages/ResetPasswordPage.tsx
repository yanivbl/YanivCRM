import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { Spinner } from '../components/ui/Spinner';

export function ResetPasswordPage() {
  const { session, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">קביעת סיסמה חדשה</h1>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : session ? (
          <>
            <p className="mb-6 text-center text-sm text-gray-500">בחר/י סיסמה חדשה לחשבון שלך</p>
            <ResetPasswordForm />
          </>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-gray-600">
              הקישור לא תקין או שפג תוקפו. בקש/י קישור חדש לאיפוס הסיסמה.
            </p>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              בקשת קישור חדש
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
