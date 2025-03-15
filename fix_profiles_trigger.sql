-- Updated handle_new_user function to match the profiles table schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name,
    raw_user_meta_data
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 