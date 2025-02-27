-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('mentor', 'mentee')),
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own data
CREATE POLICY IF NOT EXISTS "Users can view own data" 
  ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY IF NOT EXISTS "Users can update own data" 
  ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own data
CREATE POLICY IF NOT EXISTS "Users can insert own data" 
  ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow public access for role checks
CREATE POLICY IF NOT EXISTS "Allow public read access to users for role checks" 
  ON public.users
  FOR SELECT 
  USING (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon; 