-- Check if the profiles table exists and create it if necessary
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      email TEXT,
      username TEXT UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      name TEXT,
      raw_user_meta_data JSONB,
      CONSTRAINT username_length CHECK (char_length(username) >= 3)
    );
  END IF;
END
$$;

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace the policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Check tables that exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Check if the trigger exists
SELECT tgname, tgrelid::regclass AS table_name, tgtype, tgenabled, tgisinternal
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check if the function exists
SELECT proname, pronamespace::regnamespace AS schema_name, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Recreate the trigger function to handle either table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  users_table_exists BOOLEAN;
  profiles_table_exists BOOLEAN;
BEGIN
  -- Check which tables exist
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) INTO users_table_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO profiles_table_exists;
  
  -- Insert debug log
  RAISE NOTICE 'Trigger fired for user_id: %, email: %, users_exists: %, profiles_exists: %', 
    NEW.id, NEW.email, users_table_exists, profiles_table_exists;
  
  -- Insert into users table if it exists
  IF users_table_exists THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Insert into profiles table if it exists
  IF profiles_table_exists THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If the user already exists, do nothing
    RAISE NOTICE 'User already exists: %', NEW.id;
    RETURN NEW;
  WHEN others THEN
    -- Log other errors but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Explicitly grant permissions to both tables
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role, anon, authenticated;

-- Try to manually insert the record for our test user into both tables
DO $$
DECLARE
  users_table_exists BOOLEAN;
  profiles_table_exists BOOLEAN;
BEGIN
  -- Check which tables exist
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) INTO users_table_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO profiles_table_exists;
  
  -- Insert into users table if it exists
  IF users_table_exists THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      '9c9cf51a-a774-406f-8928-eade48844ccf',
      'test.user123@gmail.com',
      'Test User'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Insert into profiles table if it exists
  IF profiles_table_exists THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      '9c9cf51a-a774-406f-8928-eade48844ccf',
      'test.user123@gmail.com',
      'Test User'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role; 