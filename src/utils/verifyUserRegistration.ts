import { supabase } from './supabase/client';

/**
 * Verifies that a user is properly registered in the database
 * 
 * @param userId The ID of the user to check
 * @returns An object containing the verification results
 */
export async function verifyUserRegistration(userId: string): Promise<{
  userExists: boolean;
  profileExists: boolean;
  profile?: any;
  error?: string;
}> {
  try {
    // Check if a profile was created for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      return {
        userExists: true, // We assume the user exists since we have their ID from the session
        profileExists: false,
        error: `Profile error: ${profileError.message}`
      };
    }
    
    return {
      userExists: true, // We assume the user exists since we have their ID from the session
      profileExists: !!profile,
      profile: profile || null
    };
  } catch (error) {
    return {
      userExists: false,
      profileExists: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Tests the user registration flow by creating a test user and verifying
 * that a profile is automatically created
 * 
 * @returns Results of the test
 */
export async function testUserRegistrationFlow(): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  profileData?: any;
}> {
  try {
    // Generate a random email to avoid conflicts
    const testEmail = `test_${Math.random().toString(36).substring(2, 10)}@example.com`;
    const testPassword = 'Test123!@#';
    
    // Create a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      return {
        success: false,
        message: `Failed to create test user: ${signUpError.message}`
      };
    }
    
    if (!signUpData.user) {
      return {
        success: false,
        message: 'No user returned from signUp'
      };
    }
    
    const userId = signUpData.user.id;
    
    // Wait a moment to allow the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the user registration
    const verificationResult = await verifyUserRegistration(userId);
    
    if (!verificationResult.profileExists) {
      return {
        success: false,
        message: `User created but profile was not created. Error: ${verificationResult.error || 'Unknown error'}`,
        userId
      };
    }
    
    return {
      success: true,
      message: 'User successfully created with profile',
      userId,
      profileData: verificationResult.profile
    };
  } catch (error) {
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 