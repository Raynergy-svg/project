-- Add stripe_customer_id column to existing users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON auth.users(stripe_customer_id);

-- Enable RLS if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
    CREATE POLICY "Users can view their own data"
        ON auth.users FOR SELECT
        USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service role can manage users"
        ON auth.users FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role')
        WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$; 