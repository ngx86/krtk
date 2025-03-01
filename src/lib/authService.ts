import { supabase, getRedirectUrl } from './supabaseClient';
import { AuthError, AuthResponse } from '@supabase/supabase-js';

// Define a constant for the auth callback path
export const AUTH_CALLBACK_PATH = '/auth/callback';

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Signing in with password, redirect to:', getRedirectUrl(AUTH_CALLBACK_PATH));
    
    // Use the correct parameter structure for the current Supabase version
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  } catch (error) {
    console.error('Error signing in with password:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Signing up, redirect to:', getRedirectUrl(AUTH_CALLBACK_PATH));
    
    // Use the correct parameter structure for the current Supabase version
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(AUTH_CALLBACK_PATH)
      }
    });
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in with OTP (magic link)
 */
export const signInWithOtp = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('Signing in with OTP, redirect to:', getRedirectUrl(AUTH_CALLBACK_PATH));
    
    // Use the correct parameter structure for the current Supabase version
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(AUTH_CALLBACK_PATH)
      }
    });
  } catch (error) {
    console.error('Error signing in with OTP:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return { session: null, error };
    }
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Exception getting session:', error);
    return { session: null, error: error as AuthError };
  }
};

/**
 * Get the current user
 */
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return { user: null, error };
    }
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Exception getting user:', error);
    return { user: null, error: error as AuthError };
  }
};

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
    
    // Add a timeout promise to prevent hanging
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        console.warn('getUserRole timed out after 5 seconds');
        reject(new Error('Timeout fetching user role'));
      }, 5000);
    });
    
    // First try with standard select
    const fetchRolePromise = (async () => {
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
          
          // Make sure we're fetching from the correct table
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
    })();
    
    // Race between the actual fetch and the timeout
    try {
      return await Promise.race([fetchRolePromise, timeoutPromise]);
    } catch (timeoutError) {
      console.error('Timed out fetching user role:', timeoutError);
      return null;
    }
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