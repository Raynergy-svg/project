-- Create a stored procedure to manually confirm a user's email
CREATE OR REPLACE FUNCTION create_email_confirmation_procedure() 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the procedure to confirm a user's email
  CREATE OR REPLACE FUNCTION manually_confirm_user(user_id UUID)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $inner$
  BEGIN
    -- Update the user's confirmation status
    UPDATE auth.users
    SET email_confirmed_at = now(),
        confirmed_at = now()
    WHERE id = user_id;
  END;
  $inner$;

  -- Grant execute permission to the service_role
  GRANT EXECUTE ON FUNCTION manually_confirm_user(UUID) TO service_role;
END;
$$;

-- Grant execute permission to the service_role for the creation function
GRANT EXECUTE ON FUNCTION create_email_confirmation_procedure() TO service_role; 