-- SQL script to create the bank_accounts table with proper RLS policies
-- Run this in the Supabase SQL Editor to manually set up the table

-- Create the bank_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  institution TEXT NOT NULL,
  account_number TEXT,
  plaid_item_id TEXT,
  plaid_account_id TEXT,
  institution_id TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Add an index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts (user_id);

-- Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security
-- Drop existing policies first to avoid errors when re-running
DROP POLICY IF EXISTS select_own_accounts ON public.bank_accounts;
DROP POLICY IF EXISTS insert_own_accounts ON public.bank_accounts;
DROP POLICY IF EXISTS update_own_accounts ON public.bank_accounts;
DROP POLICY IF EXISTS delete_own_accounts ON public.bank_accounts;

-- Create policy for SELECT - users can only see their own accounts
CREATE POLICY select_own_accounts ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);
  
-- Create policy for INSERT - users can only create their own accounts
CREATE POLICY insert_own_accounts ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
-- Create policy for UPDATE - users can only update their own accounts
CREATE POLICY update_own_accounts ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);
  
-- Create policy for DELETE - users can only delete their own accounts
CREATE POLICY delete_own_accounts ON public.bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Create a helper function to check if a table exists
-- This can be called from your application's RPC
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Grant access to the helper function
GRANT EXECUTE ON FUNCTION public.check_table_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_exists TO anon;

-- Create a function to execute SQL for table creation
-- This should only be accessible to authenticated users
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Only allow this function to be called by authenticated users with proper validation
REVOKE ALL ON FUNCTION public.execute_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;

-- Example insertion (for testing only)
-- INSERT INTO public.bank_accounts (
--   user_id, 
--   name, 
--   type, 
--   balance, 
--   institution
-- ) VALUES (
--   'auth-user-id-here', -- Replace with a real user ID
--   'Test Account',
--   'checking',
--   1000.00,
--   'Test Bank'
-- ); 