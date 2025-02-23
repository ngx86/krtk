import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { AuthCallback } from './components/AuthCallback';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <div className="min-h-screen bg-background">
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App; 