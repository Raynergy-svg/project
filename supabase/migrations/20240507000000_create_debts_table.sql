-- Create debts table for storing user debt information
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'loan', 'mortgage', 'student_loan', 'medical', 'other')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  interest_rate DECIMAL(6, 3) NOT NULL CHECK (interest_rate >= 0),
  minimum_payment DECIMAL(12, 2) NOT NULL CHECK (minimum_payment >= 0),
  due_date DATE,
  notes TEXT,
  priority INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_type ON public.debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_amount ON public.debts(amount);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON public.debts(created_at);

-- Enable Row Level Security
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view only their own debts
CREATE POLICY "Users can view their own debts"
  ON public.debts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own debts
CREATE POLICY "Users can insert their own debts"
  ON public.debts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own debts
CREATE POLICY "Users can update their own debts"
  ON public.debts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own debts
CREATE POLICY "Users can delete their own debts"
  ON public.debts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO service_role;

-- Create view for debts summary
CREATE OR REPLACE VIEW public.user_debt_summary AS
SELECT 
  user_id,
  COUNT(*) as debt_count,
  SUM(amount) as total_debt,
  SUM(minimum_payment) as total_minimum_payment,
  MAX(interest_rate) as highest_interest_rate
FROM 
  public.debts
GROUP BY 
  user_id;

-- Grant access to the view
GRANT SELECT ON public.user_debt_summary TO service_role; 