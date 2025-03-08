-- Migration: Create migrations tracking table
-- Created at: 2023-09-01T00:00:00.000Z

-- Up Migration
BEGIN;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS management;

-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS management.migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  migration_number VARCHAR(6) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by VARCHAR(255),
  environment VARCHAR(50) NOT NULL,
  checksum VARCHAR(64) -- To verify if a migration file has been modified
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_number ON management.migrations(migration_number);

-- Comment on table and columns for documentation
COMMENT ON TABLE management.migrations IS 'Tracks all applied database migrations';
COMMENT ON COLUMN management.migrations.name IS 'Migration filename';
COMMENT ON COLUMN management.migrations.migration_number IS 'Sequentially numbered migration';
COMMENT ON COLUMN management.migrations.applied_at IS 'When the migration was applied';
COMMENT ON COLUMN management.migrations.applied_by IS 'Username or process that applied the migration';
COMMENT ON COLUMN management.migrations.environment IS 'Environment where migration was applied (local, staging, production)';
COMMENT ON COLUMN management.migrations.checksum IS 'Hash of migration file content to detect modifications';

-- Create function to insert the current migration
INSERT INTO management.migrations (name, migration_number, applied_by, environment, checksum)
VALUES (
  '00001_create_migrations_table.sql',
  '000001',
  current_user,
  current_setting('app.environment', true) :: VARCHAR,
  NULL
);

COMMIT;

-- Down Migration
BEGIN;

-- Drop the migrations table
DROP TABLE IF EXISTS management.migrations;

-- Drop the schema if it's empty
DROP SCHEMA IF EXISTS management CASCADE;

COMMIT; 