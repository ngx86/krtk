import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fix issue with window access in non-browser environments
const isBrowser = typeof window !== 'undefined';

// Function to check if we're on a deployed preview
export const isVercelPreview = isBrowser && 
  window.location.hostname.includes('vercel.app');

// Function to check if we're on the main site domain
export const isMainDomain = isBrowser && 
  (window.location.hostname === 'www.rvzn.app' || 
   window.location.hostname === 'rvzn.app');

// Get the current domain for url construction
const currentDomain = isBrowser ? window.location.origin : 'https://www.rvzn.app';

// CRITICAL FIX: Extract the domain for cookie handling
const getDomain = (): string | undefined => {
  if (!isBrowser) return undefined;
  
  const hostname = window.location.hostname;
  
  // For localhost, return undefined (browser will use localhost)
  if (hostname === 'localhost') return undefined;
  
  // For all other domains, strip subdomains to get root domain for cookie sharing
  // This handles both www.rvzn.app and rvzn.app by setting cookie domain to .rvzn.app
  const segments = hostname.split('.');
  
  // Handle cases like "app.example.com" or "www.example.com"
  if (segments.length > 2) {
    // Remove the first segment (subdomain) and prepend with dot
    // This makes cookies work for all subdomains
    return '.' + segments.slice(1).join('.');
  } 
  
  // Handle cases like "example.com" - prepend with dot for all subdomains
  return '.' + hostname;
};

// Determine redirect URL for auth callbacks
export const getRedirectUrl = (path: string): string => {
  // In development, use localhost
  if (isBrowser && window.location.hostname === 'localhost') {
    return `http://localhost:${window.location.port}${path}`;
  }
  
  // For production and all other environments, use CURRENT origin
  // This is critical - we want the redirect to go back to where the user came from
  return `${currentDomain}${path}`;
};

// Safe localStorage access function for reuse
export const safeGetLocalStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  } catch (err) {
    console.error('Error accessing localStorage:', err);
    return null;
  }
};

// Configure the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // We handle redirects ourselves to ensure consistent URLs
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isBrowser,
    // Store everything in localStorage for resilience
    storageKey: 'supabase.auth.token',
    // Use secure PKCE flow for better security
    flowType: 'pkce',
    // Add debug log for session - helps with troubleshooting
    debug: true
  },
});

// Debug helper - call this to see current state of Supabase auth
export const debugAuthState = async () => {
  if (!isBrowser) return;
  
  console.group('🔍 DETAILED AUTH DEBUG INFO');
  
  try {
    // Check raw cookies
    console.log('🍪 Cookies:', document.cookie);
    
    // Check localStorage
    const token = localStorage.getItem('supabase.auth.token');
    console.log('💾 localStorage token exists:', !!token);
    
    // Check current session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('🔑 Current session:', {
      exists: !!sessionData.session,
      userId: sessionData.session?.user?.id,
      expiresAt: sessionData.session?.expires_at && new Date(sessionData.session.expires_at * 1000).toISOString()
    });
    
    // Get URL details
    console.log('🌐 URL info:', {
      full: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      origin: window.location.origin
    });
    
    // Check if we're in a Supabase auth flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    console.log('🔄 Auth flow indicators:', {
      hasHash: window.location.hash.length > 0,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isCallback: window.location.pathname.includes('auth/callback')
    });
    
    // Login health check
    console.log('🚦 Auth system health:', {
      isMainDomain,
      cookieDomain: getDomain(),
      isPKCEFlow: true, // We're using PKCE flow
      hasLocalSessionStorage: !!localStorage.getItem('supabase.auth.session'),
      hasLocalAuthStorage: !!localStorage.getItem('supabase.auth.token')
    });
    
  } catch (err) {
    console.error('❌ Error in auth debug:', err);
  }
  
  console.groupEnd();
};

// Log important auth domain info when in browser
if (isBrowser) {
  console.log('Supabase Auth initialized on:', {
    hostname: window.location.hostname,
    origin: window.location.origin,
    cookieDomain: getDomain(),
    isMainDomain
  });
  
  // Add a debug button to the DOM that will trigger debug info
  if (window.location.hostname !== 'www.rvzn.app' && window.location.hostname !== 'rvzn.app') {
    // Only in development or preview environments
    window.addEventListener('load', () => {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.bottom = '15px';
      div.style.right = '15px';
      div.style.zIndex = '9999';
      
      const button = document.createElement('button');
      button.innerText = '🐞 Debug Auth';
      button.style.backgroundColor = '#222';
      button.style.color = 'white';
      button.style.padding = '8px 12px';
      button.style.borderRadius = '4px';
      button.style.fontSize = '12px';
      button.style.cursor = 'pointer';
      button.style.border = 'none';
      button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      button.onclick = () => debugAuthState();
      
      div.appendChild(button);
      document.body.appendChild(div);
    });
  }
}

// Add helper function to check if we have a token
export const hasAuthToken = (): boolean => {
  return !!safeGetLocalStorage('supabase.auth.token');
};

// Add immediate debug call - will run on import
if (isBrowser) {
  setTimeout(() => {
    console.log('====== AUTOMATIC AUTH DEBUG ======');
    debugAuthState();
    console.log('=================================');
  }, 1000);
}

