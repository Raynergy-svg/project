-- SQL script to add the execute_sql function to Supabase
-- This function allows executing SQL statements from the application

-- Create the execute_sql function that accepts a SQL parameter
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.execute_sql(text) IS 'Executes the provided SQL statement with security definer privileges. Use with caution.';

-- Also add the alternative version that returns void, which is used in some parts of the app
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Only allow this function to be called by authenticated users with proper validation
REVOKE ALL ON FUNCTION public.execute_sql(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;

-- Add a comment explaining this version of the function
COMMENT ON FUNCTION public.execute_sql(TEXT) IS 'Executes the provided SQL statement with security definer privileges without returning a result. Use with caution.'; 