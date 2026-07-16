import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RootRoute } from './routes/RootRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { LeadsListPage } from './pages/LeadsListPage';
import { LeadNewPage } from './pages/LeadNewPage';
import { LeadEditPage } from './pages/LeadEditPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { TeamPage } from './pages/TeamPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<RootRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/leads" element={<LeadsListPage />} />
              <Route path="/leads/new" element={<LeadNewPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />
              <Route path="/leads/:id/edit" element={<LeadEditPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/activity" element={<ActivityLogPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
