import { supabase } from './supabaseClient';
import { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signUp({ email, password });
}

/**
 * Sign in with magic link (OTP)
 */
export async function signInWithOtp(email: string): Promise<{ error: AuthError | null }> {
  return supabase.auth.signInWithOtp({ email });
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  return supabase.auth.signOut();
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{ data: { session: Session | null } }> {
  return supabase.auth.getSession();
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Function to store user role in database
export async function storeUserRole(userId: string, email: string | undefined, role: 'mentor' | 'mentee'): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email,
      role,
      credits: role === 'mentee' ? 3 : 0, // Give mentees 3 initial credits
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error storing user role:', error);
    throw error;
  }
}

// Fetch user role from database
export async function getUserRole(userId: string): Promise<'mentor' | 'mentee' | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  
  return data?.role || null;
}

// Check if user exists in database
export async function checkUserExists(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking user:', error);
  }
  
  return !!data;
} 