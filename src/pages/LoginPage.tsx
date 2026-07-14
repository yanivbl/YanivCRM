import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const { session, loading } = useAuth();

  if (!loading && session) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">LeadBase AI</h1>
        <p className="mb-6 text-center text-sm text-gray-500">התחברות לחשבון שלך</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          אין לך חשבון?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
}
