import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RoleSelection } from './components/RoleSelection';
import AuthCallback from './components/AuthCallback';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingProvider>
            <AppProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/role-selection" element={<ProtectedRoleSelection />} />
                  <Route path="/dashboard/*" element={<ProtectedRoute />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Router>
            </AppProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Protect the role selection page to ensure only authenticated users can access it
function ProtectedRoleSelection() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Use a mounted flag to prevent state updates after unmount
    let mounted = true;
    
    const checkStatus = async () => {
      try {
        console.log('ProtectedRoleSelection: Initial state', { 
          hasUser: !!user,
          userId: user?.id,
          userRole,
          loading
        });
        
        // Wait for auth to finish loading
        if (loading) return;
        
        if (!user) {
          console.log('ProtectedRoleSelection: No user, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        if (userRole) {
          console.log('ProtectedRoleSelection: User has role, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        if (mounted) {
          setCheckingStatus(false);
        }
      } catch (error) {
        console.error('ProtectedRoleSelection: Error checking status', error);
        if (mounted) {
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, loading, userRole, navigate]);

  if (loading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner fullScreen={false} />
        <p className="ml-2 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // Only render the role selection if user is authenticated and has no role yet
  return user && !userRole ? <RoleSelection /> : null;
}

function ProtectedRoute() {
  const { user, userRole, loading, isAuthenticated, checkSessionActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Use a mounted flag to prevent state updates after unmount
    let mounted = true;
    let initialCheckDone = false;
    
    const checkStatus = async () => {
      try {
        // Skip redundant checks once we've validated the session
        if (sessionChecked && isAuthenticated && user) {
          console.log('ProtectedRoute: Session already checked and valid, skipping checks');
          if (mounted && checkingStatus) {
            setCheckingStatus(false);
          }
          return;
        }
        
        console.log('ProtectedRoute: Checking auth state', { 
          hasUser: !!user,
          userId: user?.id,
          userRole,
          loading,
          isAuthenticated,
          path: location.pathname
        });
        
        // Wait for auth to finish loading
        if (loading) return;
        
        // Prevent multiple initial checks
        if (initialCheckDone) return;
        initialCheckDone = true;
        
        // For navigation to dashboard routes, do a quick session check first
        // This prevents unnecessary redirects during navigation
        if (location.pathname.includes('/dashboard')) {
          const sessionActive = await checkSessionActive();
          console.log('ProtectedRoute: Session active check:', sessionActive);
          
          if (!sessionActive) {
            // Add a small delay before redirecting to allow for potential auth state updates
            console.log('ProtectedRoute: Session appears inactive, waiting briefly before redirect');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Recheck session after the delay
            const recheckSession = await checkSessionActive();
            if (!recheckSession) {
              console.log('ProtectedRoute: Session confirmed inactive, redirecting to login');
              if (mounted) {
                navigate('/login', { replace: true });
                return;
              }
            } else {
              console.log('ProtectedRoute: Session reactivated during delay, continuing');
            }
          }
          
          if (mounted) {
            setSessionChecked(true);
          }
        }
        
        // Now do a full auth check for the initial page load
        if (!user || !isAuthenticated) {
          // Add a brief delay before redirecting
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Recheck authentication after delay
          if (!user || !isAuthenticated) {
            console.log('ProtectedRoute: No user or not authenticated after delay, redirecting to login');
            if (mounted) {
              navigate('/login', { replace: true });
              return;
            }
          }
        }
        
        if (!userRole) {
          console.log('ProtectedRoute: User has no role, redirecting to role selection');
          if (mounted) {
            navigate('/role-selection', { replace: true });
            return;
          }
        }
        
        if (mounted) {
          console.log('ProtectedRoute: User authenticated and has role, rendering dashboard');
          setCheckingStatus(false);
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('ProtectedRoute: Error checking status', error);
        if (mounted) {
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, userRole, loading, isAuthenticated, navigate, location, checkSessionActive, sessionChecked, checkingStatus]);

  if (loading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner fullScreen={false} />
        <p className="ml-2 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Only render the app layout if user is authenticated and has a role
  return user && userRole ? <AppLayout /> : null;
}

export default App; 