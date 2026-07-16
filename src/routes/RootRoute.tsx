import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';
import { LandingPage } from '../pages/LandingPage';
import { DashboardLayout } from '../pages/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';

// "/" is dual-purpose: a public landing page when signed out, the dashboard
// when signed in — every other authenticated route stays behind ProtectedRoute.
export function RootRoute() {
  const { session, loading } = useAuth();

  if (loading) return <Spinner fullScreen />;
  if (!session) return <LandingPage />;

  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
