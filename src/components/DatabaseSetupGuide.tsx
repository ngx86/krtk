import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, Copy, Check } from 'lucide-react';

interface DatabaseSetupGuideProps {
  error?: string | null;
  onClose?: () => void;
}

export function DatabaseSetupGuide({ error, onClose }: DatabaseSetupGuideProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- This script sets up the necessary database tables and policies for the application
-- Run this in your Supabase SQL Editor

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
CREATE POLICY "Users can view own data" 
  ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" 
  ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert own data" 
  ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow public access for role checks
CREATE POLICY "Allow public read access to users for role checks" 
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
EXECUTE FUNCTION public.update_updated_at_column();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Database Setup Guide</CardTitle>
        <CardDescription>
          Follow these steps to set up your database in Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="instructions">
          <TabsList className="mb-4">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="sql">SQL Script</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instructions">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Setting up your database</h3>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Log in to your Supabase dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://supabase.com/dashboard</a></li>
                <li>Select your project</li>
                <li>Go to the SQL Editor in the left sidebar</li>
                <li>Click "New Query"</li>
                <li>Copy the SQL script from the "SQL Script" tab</li>
                <li>Paste it into the SQL Editor</li>
                <li>Click "Run" to execute the script</li>
                <li>Return to the application and try setting your role again</li>
              </ol>
              
              <p className="text-sm text-muted-foreground mt-4">
                This will create the necessary tables and security policies for the application to function correctly.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="sql">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                {sqlScript}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {onClose && (
        <CardFooter className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      )}
    </Card>
  );
} 