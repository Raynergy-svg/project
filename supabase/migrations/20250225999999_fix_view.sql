-- Drop existing view
DROP VIEW IF EXISTS active_subscriptions;

-- Create view for active subscriptions
CREATE VIEW active_subscriptions AS
SELECT s.*, au.email, u.full_name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN auth.users au ON s.user_id = au.id
WHERE s.status = 'active'
  AND s.current_period_end > NOW(); 