import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MentorDashboard } from './MentorDashboard';
import { MenteeDashboard } from './MenteeDashboard';
import { MentorsPage } from './MentorsPage';
import { RequestFeedbackPage } from './RequestFeedbackPage';
import { MentorProfilePage } from './MentorProfilePage';
import { ReviewsPage } from './ReviewsPage';
import { NotificationsPage } from './NotificationsPage';
import { FeedbackHistoryPage } from './FeedbackHistoryPage';
import { EarningsPage } from './EarningsPage';
import { RatingsPage } from './RatingsPage';
import { CreditsPage } from './CreditsPage';
import { SettingsPage } from './SettingsPage';
import { Breadcrumbs } from './Breadcrumbs';
import { useApp } from '../contexts/AppContext';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, credits, setUserRole } = useApp();
  const role = user?.role || 'mentee';

  const handleRoleChange = (newRole: 'mentee' | 'mentor') => {
    setUserRole(newRole);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        role={role}
        credits={credits}
        setRole={handleRoleChange}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex">
        <Sidebar 
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-8 lg:ml-64 mt-14">
          <Breadcrumbs />
          <Routes>
            <Route path="/" element={role === 'mentee' ? <MenteeDashboard /> : <MentorDashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/mentor/:mentorId" element={<MentorProfilePage />} />
            <Route path="/mentor/:mentorId/reviews" element={<ReviewsPage />} />
            <Route path="/request-feedback" element={<RequestFeedbackPage />} />
            <Route path="/feedback-history" element={<FeedbackHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/ratings" element={<RatingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 