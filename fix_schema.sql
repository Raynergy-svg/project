-- Schema fix script for Supabase authentication issues
-- Run this in the Supabase dashboard SQL editor

-- 1. First, check if the raw_app_meta_data column exists in auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = 'raw_app_meta_data'
    ) THEN
        -- Add the raw_app_meta_data column if missing
        ALTER TABLE auth.users
        ADD COLUMN raw_app_meta_data jsonb DEFAULT '{}';
    END IF;
END $$;

-- 2. Check if the raw_user_meta_data column exists in auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = 'raw_user_meta_data'
    ) THEN
        -- Add the raw_user_meta_data column if missing
        ALTER TABLE auth.users
        ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}';
    END IF;
END $$;

-- 3. Add or ensure is_premium field exists in public.profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'is_premium'
    ) THEN
        -- Add the is_premium column if missing
        ALTER TABLE public.profiles
        ADD COLUMN is_premium boolean DEFAULT false;
    END IF;
END $$;

-- 4. Fix any broken foreign key references
DO $$
BEGIN
    -- Check if any records in profiles don't have matching auth.users entries
    FOR r IN
        SELECT p.id
        FROM public.profiles p
        LEFT JOIN auth.users u ON p.id = u.id
        WHERE u.id IS NULL
    LOOP
        RAISE NOTICE 'Orphaned profile detected with ID: %', r.id;
        -- Option: Delete orphaned profiles that have no auth.users entry
        -- DELETE FROM public.profiles WHERE id = r.id;
    END LOOP;
END $$;

-- 5. Check for and fix any problematic constraints
DO $$
DECLARE
    broken_constraint text;
BEGIN
    -- Find any invalid constraints
    SELECT conname INTO broken_constraint
    FROM pg_constraint c
    JOIN pg_namespace n ON c.connamespace = n.oid
    JOIN pg_class cl ON c.conrelid = cl.oid
    WHERE n.nspname = 'auth' AND cl.relname = 'users'
    AND NOT c.convalidated
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE 'Invalid constraint found: %', broken_constraint;
        -- Option to validate the constraint
        -- EXECUTE 'ALTER TABLE auth.users VALIDATE CONSTRAINT ' || broken_constraint;
    END IF;
END $$;

-- 6. Reset any locks that might be causing problems
-- Note: This requires superuser privileges
-- SELECT pg_advisory_unlock_all();

-- 7. Add any missing triggers that might be needed for authentication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND event_object_table = 'users'
        AND trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE 'Missing on_auth_user_created trigger';
        -- Would need to create the appropriate trigger here if missing
    END IF;
END $$;

-- 8. Add index to improve authentication performance if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'auth'
        AND tablename = 'users'
        AND indexname = 'users_email_idx'
    ) THEN
        CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
    END IF;
END $$; 