import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { AuthCallback } from './components/AuthCallback';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MentorDashboard } from './components/MentorDashboard';
import { MenteeDashboard } from './components/MenteeDashboard';
import { MentorsPage } from './components/MentorsPage';
import { RequestFeedbackPage } from './components/RequestFeedbackPage';
import { MentorProfilePage } from './components/MentorProfilePage';
import { ReviewsPage } from './components/ReviewsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { FeedbackHistoryPage } from './components/FeedbackHistoryPage';
import { EarningsPage } from './components/EarningsPage';
import { RatingsPage } from './components/RatingsPage';
import { CreditsPage } from './components/CreditsPage';
import { SettingsPage } from './components/SettingsPage';
import './index.css';
import { Breadcrumbs } from './components/Breadcrumbs';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AppLayout } from './components/AppLayout';

function App() {
  const { session, loading } = useAuth();
  const [role, setRole] = useState<'mentee' | 'mentor'>('mentee');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="app-theme">
        <div className="min-h-screen bg-background dark:bg-[#121212]">
          <AuthProvider>
            <AppProvider>
              <Router>
                <Routes>
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <AppLayout />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Router>
            </AppProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Header 
              role={role}
              credits={0}
              setRole={setRole}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <div className="flex">
              <Sidebar 
                role={role}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <main className="flex-1 p-8 lg:ml-64">
                <Breadcrumbs />
                <Routes>
                  <Route path="/" element={role === 'mentee' ? <MenteeDashboard /> : <MentorDashboard />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/mentors" element={<MentorsPage />} />
                  <Route path="/mentor/:mentorId" element={<MentorProfilePage />} />
                  <Route path="/mentor/:mentorId/reviews" element={<ReviewsPage />} />
                  <Route path="/request-feedback" element={<RequestFeedbackPage />} />
                  <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/earnings" element={<EarningsPage />} />
                  <Route path="/credits" element={<CreditsPage />} />
                  <Route path="/ratings" element={<RatingsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 