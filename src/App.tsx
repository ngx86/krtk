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
import { useEffect } from 'react';
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
                  <Route path="/role-selection" element={<RoleSelection />} />
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

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { isComplete } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute: Auth state check', { 
      hasUser: !!user,
      isComplete,
      loading,
      path: location.pathname
    });
    
    if (!loading) {
      if (!user) {
        console.log('ProtectedRoute: No user, redirecting to login');
        navigate('/login', { replace: true });
      } else if (!isComplete) {
        console.log('ProtectedRoute: Onboarding incomplete, redirecting to role selection');
        navigate('/role-selection', { replace: true });
      }
    }
  }, [user, loading, isComplete, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!user || !isComplete) return null;

  return <AppLayout />;
}

export default App; 