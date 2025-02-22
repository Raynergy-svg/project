/*
     # Initial Database Schema
   
     1. New Tables
       - users
         - id (uuid, primary key)
         - email (text, unique)
         - created_at (timestamp)
       - financial_profiles
         - id (uuid, primary key)
         - user_id (uuid, foreign key)
         - monthly_income (numeric)
         - created_at (timestamp)
       - debts
         - id (uuid, primary key)
         - user_id (uuid, foreign key)
         - type (text)
         - amount (numeric)
         - interest_rate (numeric)
         - minimum_payment (numeric)
         - created_at (timestamp)
       - savings_goals
         - id (uuid, primary key)
         - user_id (uuid, foreign key)
         - name (text)
         - target_amount (numeric)
         - current_amount (numeric)
         - deadline (timestamp)
         - created_at (timestamp)
   
     2. Security
       - Enable RLS on all tables
       - Add policies for authenticated users
   */
   
   -- Users table
   CREATE TABLE IF NOT EXISTS users (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     email text UNIQUE NOT NULL,
     created_at timestamptz DEFAULT now()
   );
   
   DO $$ BEGIN
     ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   
   DO $$ BEGIN
     DROP POLICY IF EXISTS "Users can read own data" ON users;
     CREATE POLICY "Users can read own data"
       ON users
       FOR SELECT
       TO authenticated
       USING (auth.uid() = id);
   END $$;
   
   -- Financial profiles table
   CREATE TABLE IF NOT EXISTS financial_profiles (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES users(id) NOT NULL,
     monthly_income numeric NOT NULL DEFAULT 0,
     created_at timestamptz DEFAULT now()
   );
   
   DO $$ BEGIN
     ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   
   DO $$ BEGIN
     DROP POLICY IF EXISTS "Users can manage own financial profile" ON financial_profiles;
     CREATE POLICY "Users can manage own financial profile"
       ON financial_profiles
       FOR ALL
       TO authenticated
       USING (auth.uid() = user_id);
   END $$;
   
   -- Debts table
   CREATE TABLE IF NOT EXISTS debts (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES users(id) NOT NULL,
     type text NOT NULL,
     amount numeric NOT NULL DEFAULT 0,
     interest_rate numeric NOT NULL DEFAULT 0,
     minimum_payment numeric NOT NULL DEFAULT 0,
     created_at timestamptz DEFAULT now()
   );
   
   DO $$ BEGIN
     ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   
   DO $$ BEGIN
     DROP POLICY IF EXISTS "Users can manage own debts" ON debts;
     CREATE POLICY "Users can manage own debts"
       ON debts
       FOR ALL
       TO authenticated
       USING (auth.uid() = user_id);
   END $$;
   
   -- Savings goals table
   CREATE TABLE IF NOT EXISTS savings_goals (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES users(id) NOT NULL,
     name text NOT NULL,
     target_amount numeric NOT NULL DEFAULT 0,
     current_amount numeric NOT NULL DEFAULT 0,
     deadline timestamptz,
     created_at timestamptz DEFAULT now()
   );
   
   DO $$ BEGIN
     ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   
   DO $$ BEGIN
     DROP POLICY IF EXISTS "Users can manage own savings goals" ON savings_goals;
     CREATE POLICY "Users can manage own savings goals"
       ON savings_goals
       FOR ALL
       TO authenticated
       USING (auth.uid() = user_id);
   END $$;