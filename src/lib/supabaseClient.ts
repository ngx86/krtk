import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Site URL for redirects - use environment variable if available
export const siteUrl = import.meta.env.VITE_SITE_URL || 
  (import.meta.env.PROD 
    ? 'https://www.rvzn.app'
    : 'http://localhost:5173')

// Normalize URL path to ensure it starts with a forward slash
const normalizePath = (path: string) => {
  return path.startsWith('/') ? path : `/${path}`
}

// Function to generate a fully qualified redirect URL
export const getRedirectUrl = (path: string) => {
  const normalizedPath = normalizePath(path)
  const url = `${siteUrl}${normalizedPath}`
  console.log('Generated redirect URL:', url) // Helpful for debugging
  return url
}

