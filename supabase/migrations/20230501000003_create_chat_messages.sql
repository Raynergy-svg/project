-- Create chat_messages table for AI support chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages(timestamp);
-- Add RLS policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- Users can only read their own messages
CREATE POLICY "Users can read only their own messages" ON chat_messages FOR
SELECT USING (auth.uid() = user_id);
-- Users can only insert their own messages
CREATE POLICY "Users can insert only their own messages" ON chat_messages FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Create function to cleanup old chat sessions after 30 days
CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
DELETE FROM chat_messages
WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;
-- Set up a scheduled job to run the cleanup function daily
SELECT cron.schedule(
        'cleanup-old-chat-sessions',
        '0 3 * * *',
        -- Run at 3am every day
        $$SELECT cleanup_old_chat_sessions() $$
    );
-- Comments
COMMENT ON TABLE chat_messages IS 'Stores chat messages between users and the AI assistant';
COMMENT ON COLUMN chat_messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN chat_messages.user_id IS 'User who sent or received the message';
COMMENT ON COLUMN chat_messages.session_id IS 'Unique identifier for the chat session';
COMMENT ON COLUMN chat_messages.content IS 'Message content';
COMMENT ON COLUMN chat_messages.role IS 'Role of the message sender (user or assistant)';
COMMENT ON COLUMN chat_messages.timestamp IS 'Time the message was sent';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional metadata for the message, like AI confidence score';