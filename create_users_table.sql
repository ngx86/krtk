-- This function creates the users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'users'
  ) THEN
    -- Create the users table
    CREATE TABLE public.users (
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
    CREATE POLICY "Users can view own data" ON public.users
      FOR SELECT USING (auth.uid() = id);

    -- Allow users to update their own data
    CREATE POLICY "Users can update own data" ON public.users
      FOR UPDATE USING (auth.uid() = id);

    -- Allow the service role to do anything
    CREATE POLICY "Service role can do anything" ON public.users
      USING (auth.role() = 'service_role');

    -- Allow authenticated users to insert their own data
    CREATE POLICY "Users can insert own data" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);

    -- Allow public access for role checks
    CREATE POLICY "Allow public read access to users for role checks" ON public.users
      FOR SELECT USING (true);

    RAISE NOTICE 'Created users table with RLS policies';
  ELSE
    RAISE NOTICE 'Users table already exists';
  END IF;
END;
$$; 