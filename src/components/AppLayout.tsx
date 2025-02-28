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
import { FeedbackHistoryPage } from './FeedbackHistoryPage';
import { EarningsPage } from './EarningsPage';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { credits } = useApp();
  const { user, userRole, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localLoading) {
        console.warn('Dashboard loading timed out after 8 seconds, resetting loading state');
        setLocalLoading(false);
      }
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [localLoading]);

  // Handle auth state
  useEffect(() => {
    console.log('AppLayout: User state:', { 
      hasUser: !!user,
      role: userRole,
      id: user?.id,
      isLoading: loading
    });
    
    if (loading) {
      setLocalLoading(true);
      return;
    }
    
    // Allow small delay to ensure everything is loaded
    const timerId = setTimeout(() => {
      setLocalLoading(false);
      
      if (!user) {
        console.log('AppLayout: No user, redirecting to login');
        navigate('/login');
      } else if (!userRole) {
        console.log('AppLayout: User has no role, redirecting to role selection');
        navigate('/role-selection');
      }
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [user, userRole, loading, navigate]);

  // Show loading state
  if (loading || localLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner fullScreen={false} />
        <p className="ml-2 text-muted-foreground">Loading your dashboard...</p>
        <button 
          onClick={() => setLocalLoading(false)} 
          className="mt-8 text-sm text-blue-500 hover:underline"
        >
          Loading taking too long? Click here
        </button>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!userRole) {
    navigate('/role-selection');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        role={userRole}
        credits={credits}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <Sidebar
        role={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <main className="py-20 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Common routes */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* Role-specific routes */}
            {userRole === 'mentee' ? (
              <>
                <Route index element={<MenteeDashboard />} />
                <Route path="/mentors" element={<MentorsPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/request-feedback/:mentorId" element={<RequestFeedbackPage />} />
                <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
              </>
            ) : (
              <>
                <Route index element={<MentorDashboard />} />
                <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
                <Route path="/earnings" element={<EarningsPage />} />
              </>
            )}
            
            {/* Catch any invalid routes and redirect to dashboard index */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 