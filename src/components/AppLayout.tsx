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
      // Only start checks if we're not loading
      if (!authLoading && mounted) {
        console.log('AppLayout: Auth loading complete, checking user state', {
          hasUser: !!user,
          userRole,
          isAuthenticated,
          path: location.pathname
        });
        
        // For dashboard routes, assume the ProtectedRoute component has already checked auth
        if (location.pathname.includes('/dashboard')) {
          // For request-feedback routes, perform a lightweight auth check instead of skipping entirely
          if (location.pathname.includes('/request-feedback')) {
            console.log('AppLayout: In request-feedback route, performing lightweight auth check');
            
            // Only do the check if we appear to be logged out
            if (!isAuthenticated || !user) {
              const sessionActive = await checkSessionActive();
              if (!sessionActive) {
                console.warn('AppLayout: Session check failed in request-feedback route');
                // If we're not authenticated, we'll handle the redirect later
              }
            }
            
            setLocalLoading(false);
            return;
          }
          
          // For all other dashboard routes, only do a session check if it appears we're not authenticated
          if (!isAuthenticated || !user) {
            console.log('AppLayout: Not authenticated, doing a quick session check');
            // Use the quick session check
            const sessionActive = await checkSessionActive();
            
            if (!sessionActive) {
              console.warn('AppLayout: Session check failed, app will redirect shortly');
              // Don't navigate here, let ProtectedRoute handle it
              return;
            }
          }
        }
        
        // Always set loading to false to allow the UI to render
        if (mounted) {
          console.log('AppLayout: Completing loading process');
          setLocalLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [user, userRole, authLoading, isAuthenticated, location, checkSessionActive]);

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

  // Check auth status for request-feedback pages with more lenient rules
  const inRequestFeedbackRoute = location.pathname.includes('/request-feedback');
  
  // Don't redirect if we're in a request-feedback route and at least have a token in localStorage
  // This helps prevent premature redirects while the auth state is being verified
  const hasLocalStorageToken = typeof window !== 'undefined' && !!localStorage.getItem('supabase.auth.token');
  
  if (!isAuthenticated && !user && !inRequestFeedbackRoute) {
    console.log('AppLayout: Not authenticated, redirecting to login');
    navigate('/login', { replace: true });
    return null;
  }
  
  // For request-feedback routes, only redirect if we definitely have no auth token
  if (!isAuthenticated && !user && inRequestFeedbackRoute && !hasLocalStorageToken) {
    console.log('AppLayout: Not authenticated in request-feedback route, redirecting to login');
    navigate('/login', { replace: true, state: { from: location.pathname } });
    return null;
  }

  // Replace the immediate redirect with a debounced version
  useEffect(() => {
    // Skip auth checks during transitions to prevent flickering
    if (authLoading) return;
    
    // Only proceed if we're definitely not in a request-feedback route
    if (!inRequestFeedbackRoute) {
      let redirectTimeout: NodeJS.Timeout | null = null;
      
      // Check if we need to redirect due to missing role
      if (!userRole && !authLoading && isAuthenticated) {
        console.log('AppLayout: User authenticated but no role, preparing to redirect');
        
        // Add a delay before redirecting to allow state to settle
        redirectTimeout = setTimeout(() => {
          // Double-check authentication state before redirecting
          if (isAuthenticated && !userRole) {
            console.log('AppLayout: Still no role after delay, redirecting to role selection');
            navigate('/role-selection', { replace: true });
          }
        }, 500); // 500ms delay gives time for role state to update
      }
      
      return () => {
        if (redirectTimeout) clearTimeout(redirectTimeout);
      };
    }
  }, [userRole, authLoading, isAuthenticated, inRequestFeedbackRoute, navigate]);

  // Determine if we should render mentee routes - INCLUDE routes when role is loading
  // This allows navigation during role fetch timeouts
  const showMenteeRoutes = userRole === 'mentee' || (!userRole && isAuthenticated) || inRequestFeedbackRoute;
  
  // Determine if we should render mentor routes - more strict, require confirmed mentor role
  const showMentorRoutes = userRole === 'mentor' && !inRequestFeedbackRoute;
  
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
                <Route path="/request-feedback" element={<RequestFeedbackPage />} />
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