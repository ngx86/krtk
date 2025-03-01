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

// Determine redirect URL for auth callbacks
export const getRedirectUrl = (path: string): string => {
  // In development, use localhost
  if (isBrowser && window.location.hostname === 'localhost') {
    return `http://localhost:${window.location.port}${path}`;
  }
  
  // Always use the www subdomain for auth on production (main site)
  // This must match the site URL configured in Supabase
  if (isMainDomain) {
    return `https://www.rvzn.app${path}`;
  }
  
  // For preview deployments and other environments, use current origin
  return `${currentDomain}${path}`;
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
  },
});

