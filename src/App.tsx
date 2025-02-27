import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { AuthCallback } from './components/AuthCallback';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RoleSelection } from './components/RoleSelection';

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
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/role-selection" element={<ProtectedRoleSelection />} />
                  <Route path="/dashboard/*" element={<ProtectedRoute />} />
                  {/* Redirect /dashboard to /dashboard/ to ensure nested routes work */}
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
  const { user, loading } = useAuth();
  const { isComplete } = useOnboarding();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('ProtectedRoleSelection: Checking status', { 
          hasUser: !!user,
          isComplete,
          loading
        });
        
        // Wait for auth to finish loading
        if (loading) return;
        
        if (!user) {
          console.log('ProtectedRoleSelection: No user, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        if (isComplete) {
          console.log('ProtectedRoleSelection: Onboarding already complete, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        setCheckingStatus(false);
      } catch (error) {
        console.error('ProtectedRoleSelection: Error checking status', error);
        navigate('/login', { replace: true });
      }
    };
    
    checkStatus();
  }, [user, loading, isComplete, navigate]);

  if (loading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // Only render the role selection if user is authenticated and onboarding is not complete
  return user && !isComplete ? <RoleSelection /> : null;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { isComplete, checkOnboardingStatus } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('ProtectedRoute: Auth state check', { 
          hasUser: !!user,
          isComplete,
          loading,
          path: location.pathname
        });
        
        // Wait for auth to finish loading
        if (loading) return;
        
        if (!user) {
          console.log('ProtectedRoute: No user, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        // Refresh onboarding status to ensure it's up to date
        await checkOnboardingStatus();
        
        if (!isComplete) {
          console.log('ProtectedRoute: Onboarding incomplete, redirecting to role selection');
          navigate('/role-selection', { replace: true });
          return;
        }
        
        setCheckingStatus(false);
      } catch (error) {
        console.error('ProtectedRoute: Error checking status', error);
        navigate('/login', { replace: true });
      }
    };
    
    checkStatus();
  }, [user, loading, isComplete, navigate, location, checkOnboardingStatus]);

  if (loading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Only render the app layout if user is authenticated and onboarding is complete
  return user && isComplete ? <AppLayout /> : null;
}

export default App; 