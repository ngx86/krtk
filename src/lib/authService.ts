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
  try {
    if (!userId) {
      console.error('storeUserRole: Missing userId');
      throw new Error('User ID is required');
    }

    console.log('Storing role for user:', userId, 'Role:', role);
    
    // First check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing user:', checkError);
    }
    
    // If user exists, update. Otherwise, insert.
    if (existingUser) {
      console.log('User exists, updating role');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role,
          email,
          credits: role === 'mentee' ? 3 : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user role:', updateError);
        throw updateError;
      }
    } else {
      console.log('User does not exist, inserting new record');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          role,
          credits: role === 'mentee' ? 3 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error inserting user role:', insertError);
        throw insertError;
      }
    }
    
    console.log('Successfully stored role for user:', userId);
  } catch (error) {
    console.error('Exception storing user role:', error);
    throw error;
  }
}

// Fetch user role from database
export async function getUserRole(userId: string): Promise<'mentor' | 'mentee' | null> {
  try {
    if (!userId) {
      console.error('getUserRole called with empty userId');
      return null;
    }
    
    console.log('Fetching role for userId:', userId);
    
    // First try with standard select
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (userError) {
      console.error('Error fetching user role with standard query:', userError);
      
      // Try alternative approach with explicit headers
      try {
        // Get Supabase URL and key from environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=role`, 
          {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched user role data via fetch API:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          return data[0].role;
        }
        
        return null;
      } catch (fetchError) {
        console.error('Error with alternative fetch approach:', fetchError);
        return null;
      }
    }
    
    console.log('Fetched user role data:', userData);
    return userData?.role || null;
  } catch (error) {
    console.error('Exception fetching user role:', error);
    return null;
  }
}

// Check if user exists in database
export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.error('checkUserExists called with empty userId');
      return false;
    }
    
    console.log('Checking if user exists:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking user:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking if user exists:', error);
    return false;
  }
} 