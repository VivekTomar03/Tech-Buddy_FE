import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute, { GuestRoute } from '@/components/ProtectedRoute';
import { PageLoader } from '@/components/ui/Feedback';
import { useTheme } from '@/lib/theme';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const SetupPage = lazy(() => import('@/pages/SetupPage'));
const InterviewPage = lazy(() => import('@/pages/InterviewPage'));
const ReportPage = lazy(() => import('@/pages/ReportPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  const mode = useTheme((s) => s.mode);
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/dashboard" element={guard(<DashboardPage />)} />
            <Route path="/setup" element={guard(<SetupPage />)} />
            <Route path="/report/:id" element={guard(<ReportPage />)} />
            <Route path="/settings" element={guard(<SettingsPage />)} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Full-screen workspace, no site navbar */}
          <Route path="/interview/:id" element={guard(<InterviewPage />)} />
        </Routes>
      </Suspense>
      <Toaster theme={mode} position="bottom-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />
    </>
  );
}
