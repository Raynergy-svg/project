-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA cron;

-- Make sure the extension is enabled
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL'; 