import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { supabase } from './lib/supabaseClient'
import { Login } from './components/Login'
import { Session } from '@supabase/supabase-js'
import { AuthCallback } from './components/AuthCallback';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [role, setRole] = useState<'mentee' | 'mentor'>('mentee');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Login />
  }

  // Handle clicking outside of popups
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-popup]')) {
      // Close all popups
      document.querySelectorAll('[data-popup]').forEach(popup => {
        const popupElement = popup as HTMLElement;
        if (popupElement.style.display !== 'none') {
          const closeEvent = new Event('closepopup');
          popup.dispatchEvent(closeEvent);
        }
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header 
              role={role} 
              credits={0}
              setRole={setRole}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <Sidebar
              role={role}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <main className="lg:pl-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Breadcrumbs />
              <Routes>
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Dashboard Routes */}
                <Route path="/" element={role === 'mentee' ? <MenteeDashboard /> : <MentorDashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                {/* Mentor Routes */}
                <Route path="/mentors" element={<MentorsPage />} />
                <Route path="/mentor/:mentorId" element={<MentorProfilePage />} />
                <Route path="/mentor/:mentorId/reviews" element={<ReviewsPage />} />
                
                {/* Feedback Routes */}
                <Route path="/request-feedback" element={<RequestFeedbackPage />} />
                <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
                
                {/* Notification Routes */}
                <Route path="/notifications" element={<NotificationsPage />} />
                
                {/* Finance Routes */}
                <Route path="/earnings" element={<EarningsPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                
                {/* Profile Routes */}
                <Route path="/ratings" element={<RatingsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 