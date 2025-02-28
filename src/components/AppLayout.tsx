import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

// Type safety for role comparison
function isMentee(role: 'mentor' | 'mentee' | null): role is 'mentee' {
  return role === 'mentee';
}

function isMentor(role: 'mentor' | 'mentee' | null): role is 'mentor' {
  return role === 'mentor';
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { credits } = useApp();
  const { user, userRole, loading: authLoading, isAuthenticated, checkSessionActive } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug auth state
  useEffect(() => {
    console.log('AppLayout auth state:', { 
      hasUser: !!user, 
      userRole, 
      authLoading, 
      localLoading,
      isAuthenticated,
      pathname: location.pathname 
    });
  }, [user, userRole, authLoading, localLoading, isAuthenticated, location.pathname]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localLoading) {
        console.warn('Dashboard loading timed out after 5 seconds, resetting loading state');
        setLocalLoading(false);
      }
    }, 5000); // Reduced from 8s to 5s for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [localLoading]);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      // Only start checks if we're in the loading state
      if (!authLoading && mounted) {
        console.log('AppLayout: Auth loading complete, checking user state', {
          hasUser: !!user,
          userRole,
          isAuthenticated,
          path: location.pathname
        });
        
        // For internal navigation, just check if session still active
        // This prevents repeated full auth checks during internal navigation
        if (location.pathname.includes('/dashboard')) {
          // Skip the check for request-feedback routes since they handle their own auth
          if (location.pathname.includes('/request-feedback')) {
            console.log('AppLayout: In request-feedback route, skipping auth check');
            setLocalLoading(false);
            return;
          }
          
          // Use the quick session check for other routes
          const sessionActive = await checkSessionActive();
          
          if (!sessionActive) {
            console.warn('AppLayout: Session check failed, redirecting to login');
            navigate('/login', { replace: true });
            return;
          }
        }
        
        // Wait a little bit before finalizing to ensure both contexts are ready
        setTimeout(() => {
          if (!mounted) return;
          
          setLocalLoading(false);
          
          if (!isAuthenticated || !user) {
            console.warn('AppLayout: No user found after auth check, redirecting to login');
            navigate('/login', { replace: true });
          } else if (!userRole) {
            console.warn('AppLayout: User found but no role, redirecting to role selection');
            navigate('/role-selection', { replace: true });
          } else {
            console.log('AppLayout: User authenticated and has role, path:', location.pathname);
          }
        }, 200);
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [user, userRole, authLoading, isAuthenticated, navigate, location, checkSessionActive]);

  // Show loading state only during initial load, not during navigation
  if (authLoading && localLoading && !location.pathname.includes('/request-feedback')) {
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

  // Skip these checks for request-feedback pages which handle their own auth
  const inRequestFeedbackRoute = location.pathname.includes('/request-feedback');
  
  // Don't redirect if we're in a request-feedback route
  if (!isAuthenticated && !user && !inRequestFeedbackRoute) {
    console.log('AppLayout: Not authenticated, redirecting to login');
    navigate('/login', { replace: true });
    return null;
  }

  if (!userRole && !inRequestFeedbackRoute) {
    console.log('AppLayout: No role, redirecting to role selection');
    navigate('/role-selection', { replace: true });
    return null;
  }

  // Determine if we should render mentee routes
  const showMenteeRoutes = isMentee(userRole) || inRequestFeedbackRoute;
  // Determine if we should render mentor routes
  const showMentorRoutes = isMentor(userRole) && !inRequestFeedbackRoute;
  
  // Set a default role for components that require a non-null value
  // This ensures type safety while maintaining the actual role when available
  const safeRole: 'mentee' | 'mentor' = userRole === 'mentor' ? 'mentor' : 'mentee';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        role={safeRole}
        credits={credits}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <Sidebar
        role={safeRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <main className="py-20 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Common routes */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* Role-specific routes - allow these routes regardless of exact role match during transitions */}
            {showMenteeRoutes && (
              <>
                <Route index element={<MenteeDashboard />} />
                <Route path="/mentors" element={<MentorsPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/request-feedback/:mentorId" element={<RequestFeedbackPage />} />
                <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
              </>
            )}
            
            {showMentorRoutes && (
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