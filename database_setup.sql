-- This script sets up the necessary database tables and policies for the RVZN application
-- Run this in your Supabase SQL Editor during development/deployment

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('mentor', 'mentee')),
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create feedback_requests table
CREATE TABLE IF NOT EXISTS public.feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  design_link TEXT,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for feedback_requests
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback_requests
CREATE POLICY IF NOT EXISTS "Mentees can view own requests" 
  ON public.feedback_requests
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY IF NOT EXISTS "Mentors can view assigned requests" 
  ON public.feedback_requests
  FOR SELECT 
  USING (auth.uid() = mentor_id);

CREATE POLICY IF NOT EXISTS "Mentees can create requests" 
  ON public.feedback_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY IF NOT EXISTS "Mentees can update own requests" 
  ON public.feedback_requests
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY IF NOT EXISTS "Mentors can update assigned requests" 
  ON public.feedback_requests
  FOR UPDATE 
  USING (auth.uid() = mentor_id);

-- Grant permissions for feedback_requests
GRANT SELECT, INSERT, UPDATE ON public.feedback_requests TO authenticated;

-- Create trigger for feedback_requests updated_at
DROP TRIGGER IF EXISTS update_feedback_requests_updated_at ON public.feedback_requests;
CREATE TRIGGER update_feedback_requests_updated_at
BEFORE UPDATE ON public.feedback_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.feedback_requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY IF NOT EXISTS "Mentees can view feedback on their requests" 
  ON public.feedback
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT mentee_id FROM public.feedback_requests WHERE id = request_id
    )
  );

CREATE POLICY IF NOT EXISTS "Mentors can view feedback they provided" 
  ON public.feedback
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT mentor_id FROM public.feedback_requests WHERE id = request_id
    )
  );

CREATE POLICY IF NOT EXISTS "Mentors can create feedback" 
  ON public.feedback
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT mentor_id FROM public.feedback_requests WHERE id = request_id
    )
  );

CREATE POLICY IF NOT EXISTS "Mentees can update ratings" 
  ON public.feedback
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT mentee_id FROM public.feedback_requests WHERE id = request_id
    )
  );

-- Grant permissions for feedback
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;

-- Create trigger for feedback updated_at
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 