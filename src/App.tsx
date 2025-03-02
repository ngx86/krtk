import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <div className="min-h-screen bg-background">
        <AppProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
                <Route path="/*" element={<AppLayout />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </AppProvider>
      </div>
    </ThemeProvider>
  );
}

export default App; 