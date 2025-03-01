-- Create user_subscriptions table for tracking paid subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trial', 'unpaid')),
    plan_name TEXT NOT NULL,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);

-- Add RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read only their own subscriptions
CREATE POLICY "Users can read only their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE user_subscriptions IS 'Stores subscription information for users';
COMMENT ON COLUMN user_subscriptions.id IS 'Unique identifier for the subscription record';
COMMENT ON COLUMN user_subscriptions.user_id IS 'User who owns the subscription';
COMMENT ON COLUMN user_subscriptions.subscription_id IS 'ID from the payment provider (e.g., Stripe subscription ID)';
COMMENT ON COLUMN user_subscriptions.status IS 'Current status of the subscription';
COMMENT ON COLUMN user_subscriptions.plan_name IS 'Name of the subscription plan';
COMMENT ON COLUMN user_subscriptions.current_period_end IS 'When the current subscription period ends';
COMMENT ON COLUMN user_subscriptions.cancel_at IS 'When the subscription is scheduled to be canceled'; 