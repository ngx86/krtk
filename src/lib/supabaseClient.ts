import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const siteUrl = import.meta.env.PROD 
  ? 'https://www.rvzn.app'
  : 'http://localhost:5173'

export const getRedirectUrl = (path: string) => 
  `${siteUrl}${path}`

