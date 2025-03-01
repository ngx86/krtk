import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Site URL for redirects - use environment variable if available
export const siteUrl = import.meta.env.VITE_SITE_URL || 
  (import.meta.env.PROD 
    ? 'https://www.rvzn.app'
    : 'http://localhost:5173')

// Check if we're on a Vercel preview deployment
const isVercelPreview = typeof window !== 'undefined' && 
  window.location.hostname.includes('vercel.app')

// If we're on a Vercel preview, use the current URL as the site URL
const effectiveSiteUrl = isVercelPreview 
  ? `${window.location.protocol}//${window.location.host}`
  : siteUrl

console.log('Using site URL:', effectiveSiteUrl)

// Create Supabase client with global headers for content type
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Increase storage options to help with persistence
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: key => {
        try {
          const value = localStorage.getItem(key)
          console.log(`Retrieved auth from storage: ${key} exists: ${!!value}`)
          return value
        } catch (error) {
          console.error('Error accessing localStorage:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          console.log(`Storing auth in storage: ${key}`)
          localStorage.setItem(key, value)
        } catch (error) {
          console.error('Error writing to localStorage:', error)
        }
      },
      removeItem: key => {
        try {
          console.log(`Removing auth from storage: ${key}`)
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing from localStorage:', error)
        }
      }
    }
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
})

// Add event listeners to debug auth state
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, !!session)
    if (session) {
      console.log('Session expires at:', new Date(session.expires_at! * 1000).toLocaleString())
    }
  })
}

// Normalize URL path to ensure it starts with a forward slash
const normalizePath = (path: string) => {
  return path.startsWith('/') ? path : `/${path}`
}

// Function to generate a fully qualified redirect URL
export const getRedirectUrl = (path: string) => {
  const normalizedPath = normalizePath(path)
  const url = `${effectiveSiteUrl}${normalizedPath}`
  console.log('Generated redirect URL:', url) // Helpful for debugging
  return url
}

