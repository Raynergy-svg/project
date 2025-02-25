-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    CONSTRAINT token_not_expired CHECK (expires_at > NOW())
);

-- Create an index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    attachments TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reset tokens"
    ON password_reset_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Create RLS policies for support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view their own support tickets"
    ON support_tickets FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Support staff can view all tickets
CREATE POLICY "Support staff can view all tickets"
    ON support_tickets FOR SELECT
    USING (auth.jwt() ->> 'role' = 'support');

-- Support staff can update tickets
CREATE POLICY "Support staff can update tickets"
    ON support_tickets FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'support')
    WITH CHECK (auth.jwt() ->> 'role' = 'support');

-- Anyone can create a ticket
CREATE POLICY "Anyone can create a support ticket"
    ON support_tickets FOR INSERT
    WITH CHECK (true);

-- Create a view for active password reset tokens
CREATE OR REPLACE VIEW active_password_reset_tokens AS
SELECT *
FROM password_reset_tokens
WHERE used_at IS NULL
  AND expires_at > NOW();

-- Grant necessary permissions
GRANT SELECT, INSERT ON password_reset_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE ON support_tickets TO service_role;
GRANT SELECT ON active_password_reset_tokens TO service_role;
