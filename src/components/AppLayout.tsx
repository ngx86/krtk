import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, credits } = useApp();

  if (!user) return null;

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
            <Route 
              path="/" 
              element={user.role === 'mentee' ? <MenteeDashboard /> : <MentorDashboard />} 
            />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/request-feedback" element={<RequestFeedbackPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 