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
    // Store everything in cookies to work better across different domains
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    // Add debug log for session - helps with troubleshooting
    debug: true
  },
});

// Log important auth domain info when in browser
if (isBrowser) {
  console.log('Supabase Auth initialized on:', {
    hostname: window.location.hostname,
    origin: window.location.origin,
    cookieDomain: getDomain(),
    isMainDomain
  });
}

// Add helper function to check if we have a token
export const hasAuthToken = (): boolean => {
  return !!safeGetLocalStorage('supabase.auth.token');
};

