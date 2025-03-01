-- Fix the active_subscriptions view
DROP VIEW IF EXISTS active_subscriptions;

-- Create view for active subscriptions
CREATE VIEW active_subscriptions AS
SELECT s.*, au.email, p.name as full_name
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
JOIN auth.users au ON s.user_id = au.id
WHERE s.status = 'active'
  AND s.current_period_end > NOW(); 