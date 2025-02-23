import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface FeedbackRequest {
  id: number;
  mentee_id: string;
  mentor_id?: string;
  description: string;
  link: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  credits_cost: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: number;
  user_id: string;
  message: string;
  type: 'feedback' | 'credits' | 'system';
  read: boolean;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  role: 'mentor' | 'mentee';
  credits?: number;
}

interface AppContextType {
  user: User | null;
  credits: number;
  loading: boolean;
  notifications: Notification[];
  feedbackRequests: FeedbackRequest[];
  createFeedbackRequest: (data: Omit<FeedbackRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  acceptFeedbackRequest: (requestId: number) => Promise<void>;
  completeFeedbackRequest: (requestId: number, feedback: string) => Promise<void>;
  declineFeedbackRequest: (requestId: number, reason: string) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  purchaseCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, session } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([]);

  useEffect(() => {
    console.log('AppContext: Auth state changed', { 
      hasAuthUser: !!authUser,
      hasSession: !!session,
      authUserId: authUser?.id 
    });

    async function loadUserData() {
      if (!authUser?.id) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        console.log('AppContext: Loaded profile', { 
          hasProfile: !!profile,
          error 
        });

        if (error) throw error;

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            credits: profile.credits
          });
          setCredits(profile.credits || 0);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [authUser, session]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      subscribeToUpdates();
    }
  }, [user]);

  async function fetchUserData() {
    if (!user) return;

    // Fetch credits for mentees
    if (user.role === 'mentee') {
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      if (userData) {
        setCredits(userData.credits);
      }
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (notificationsData) {
      setNotifications(notificationsData);
    }

    // Fetch feedback requests
    const { data: requestsData } = await supabase
      .from('feedback_requests')
      .select('*')
      .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (requestsData) {
      setFeedbackRequests(requestsData);
    }
  }

  function subscribeToUpdates() {
    if (!user) return;

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      })
      .subscribe();

    // Subscribe to feedback requests
    const requestsSubscription = supabase
      .channel('feedback_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feedback_requests',
        filter: `mentee_id=eq.${user.id}`,
      }, payload => {
        if (payload.eventType === 'UPDATE') {
          setFeedbackRequests(prev => 
            prev.map(req => req.id === (payload.new as FeedbackRequest).id ? 
              payload.new as FeedbackRequest : 
              req
            )
          );
        }
      })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
    };
  }

  // Context methods
  async function createFeedbackRequest(data: Omit<FeedbackRequest, 'id' | 'created_at' | 'updated_at'>) {
    if (!user) return;

    const { error } = await supabase.from('feedback_requests').insert([{
      ...data,
      mentee_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]);

    if (error) throw error;
    await fetchUserData();
  }

  async function acceptFeedbackRequest(requestId: number) {
    if (!user) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'accepted',
        mentor_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function completeFeedbackRequest(requestId: number, feedback: string) {
    if (!user) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'completed',
        feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function declineFeedbackRequest(requestId: number, reason: string) {
    if (!user) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'declined',
        feedback: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function markNotificationAsRead(notificationId: number) {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    await fetchUserData();
  }

  async function purchaseCredits(amount: number) {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ 
        credits: (user.credits || 0) + amount 
      })
      .eq('id', user.id);

    if (error) throw error;
    await fetchUserData();
  }

  const value = {
    user,
    credits,
    loading,
    notifications,
    feedbackRequests,
    createFeedbackRequest,
    acceptFeedbackRequest,
    completeFeedbackRequest,
    declineFeedbackRequest,
    markNotificationAsRead,
    purchaseCredits,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 