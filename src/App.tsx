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
import { OnboardingProvider } from './contexts/OnboardingContext';
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
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('ProtectedRoleSelection: Checking status', { 
          hasUser: !!user,
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
          console.log('ProtectedRoleSelection: User already has role, redirecting to dashboard');
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
  const { user, userRole, loading, refreshUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('ProtectedRoute: Auth state check', { 
          hasUser: !!user,
          userRole,
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
        
        // Refresh user role to ensure it's up to date
        await refreshUserRole();
        
        if (!userRole) {
          console.log('ProtectedRoute: User has no role, redirecting to role selection');
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
  }, [user, loading, userRole, navigate, location, refreshUserRole]);

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