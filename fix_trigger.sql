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

-- Create a robust trigger function that works with various profile schemas
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  columns_info RECORD;
  has_email BOOLEAN := FALSE;
  has_name BOOLEAN := FALSE;
  has_raw_meta BOOLEAN := FALSE;
  has_username BOOLEAN := FALSE;
  has_full_name BOOLEAN := FALSE;
BEGIN
  -- Check if each column exists in the profiles table
  FOR columns_info IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  LOOP
    IF columns_info.column_name = 'email' THEN 
      has_email := TRUE;
    END IF;
    IF columns_info.column_name = 'name' THEN 
      has_name := TRUE;
    END IF;
    IF columns_info.column_name = 'raw_user_meta_data' THEN 
      has_raw_meta := TRUE;
    END IF;
    IF columns_info.column_name = 'username' THEN 
      has_username := TRUE;
    END IF;
    IF columns_info.column_name = 'full_name' THEN 
      has_full_name := TRUE;
    END IF;
  END LOOP;
  
  -- Construct the INSERT dynamically based on available columns
  EXECUTE 'INSERT INTO public.profiles (id'
    || CASE WHEN has_email THEN ', email' ELSE '' END
    || CASE WHEN has_name THEN ', name' ELSE '' END
    || CASE WHEN has_raw_meta THEN ', raw_user_meta_data' ELSE '' END
    || CASE WHEN has_username THEN ', username' ELSE '' END
    || CASE WHEN has_full_name THEN ', full_name' ELSE '' END
    || ') VALUES ($1'
    || CASE WHEN has_email THEN ', $2' ELSE '' END
    || CASE WHEN has_name THEN ', $3' ELSE '' END
    || CASE WHEN has_raw_meta THEN ', $4' ELSE '' END
    || CASE WHEN has_username THEN ', $5' ELSE '' END
    || CASE WHEN has_full_name THEN ', $6' ELSE '' END
    || ')'
  USING 
    NEW.id,
    CASE WHEN has_email THEN NEW.email ELSE NULL END,
    CASE WHEN has_name THEN NEW.raw_user_meta_data->>'name' ELSE NULL END,
    CASE WHEN has_raw_meta THEN NEW.raw_user_meta_data ELSE NULL END,
    CASE WHEN has_username THEN NEW.raw_user_meta_data->>'username' ELSE NULL END,
    CASE WHEN has_full_name THEN NEW.raw_user_meta_data->>'full_name' ELSE NULL END;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to basic insert if dynamic approach fails
    INSERT INTO public.profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role; 