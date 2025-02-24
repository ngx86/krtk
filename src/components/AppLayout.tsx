import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MenteeDashboard } from './MenteeDashboard';
import { MentorDashboard } from './MentorDashboard';
import { MentorsPage } from './MentorsPage';
import { CreditsPage } from './CreditsPage';
import { SettingsPage } from './SettingsPage';
import { NotificationsPage } from './NotificationsPage';
import { RequestFeedbackPage } from './RequestFeedbackPage';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, credits } = useApp();
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    console.log('AppLayout: User state:', { 
      hasUser: !!user,
      role: user?.role,
      id: user?.id
    });
    
    if (!user) {
      console.log('AppLayout: No user, redirecting to login');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  // Define available routes based on role
  const routes = user.role === 'mentee' ? (
    <>
      <Route path="/" element={<MenteeDashboard />} />
      <Route path="/mentors" element={<MentorsPage />} />
      <Route path="/credits" element={<CreditsPage />} />
      <Route path="/request-feedback" element={<RequestFeedbackPage />} />
    </>
  ) : (
    <>
      <Route path="/" element={<MentorDashboard />} />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        role={user.role}
        credits={credits}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <main className="py-20 px-4 sm:px-6 lg:px-8">
          <Routes>
            {routes}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* Catch any invalid routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 