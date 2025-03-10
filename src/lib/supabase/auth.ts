/**
 * Get the current user from the server side (for API routes)
 * This is used in API routes to check authentication and get user info
 */
export async function getUser() {
  try {
    const { cookies } = await import('next/headers');
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user in API route:', error);
    return null;
  }
} 