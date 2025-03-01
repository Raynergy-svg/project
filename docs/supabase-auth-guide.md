# Supabase Authentication Guide

This guide explains how to set up and use Supabase authentication in this project.

## Configuration Requirements

1. **Email Format Requirements**:
   - Supabase has specific email validation rules.
   - Email formats that work: `jane.doe@company-name.com`
   - Some formats that don't work: `user@example.com`, `user+test@example.com`
   - Always use the proper format for testing: `name@domain-name.com`

2. **Database Setup**:
   - The `profiles` table and related triggers must be created
   - Use the SQL script in `supabase/migrations/20240301_create_profiles_table.sql`

3. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations
   ```

## Authentication Flow

1. **Sign Up**:
   - User completes the sign-up form
   - Supabase creates a new user account
   - A confirmation email is sent to the user
   - User must click the confirmation link to activate their account
   - The trigger automatically creates a profile in the `profiles` table

2. **Email Confirmation**:
   - Users must confirm their email before they can sign in
   - If a user tries to sign in before confirming, they'll see an error
   - They can request a new confirmation email from the sign-in page

3. **Sign In**:
   - After email confirmation, users can sign in
   - The app stores the session in the browser
   - Session persistence is handled by Supabase

4. **Sign Out**:
   - Clears the session data
   - Redirects to the home page

## Implementation Details

### Authentication Context

The `AuthContext.tsx` provides:

- User state management
- Authentication methods (login, logout, signup)
- Session persistence
- User profile data loading

```javascript
// Example usage
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout, signup, isLoading } = useAuth();
  
  // Check if user is authenticated
  if (user) {
    // User is logged in
  }
}
```

### Sign Up Form

The sign-up process:

1. Validates user input
2. Encrypts sensitive data
3. Creates a new user with Supabase
4. Handles email confirmation flow
5. Shows confirmation instructions

### Sign In Form

The sign-in process:

1. Validates email format and credentials
2. Handles authentication errors
3. Manages email confirmation requirements
4. Redirects to dashboard after success

## Testing Authentication

1. **Test Auth Page**:
   - Visit `/test-auth` to test authentication directly in the UI
   - This page shows connection status and provides authentication test tools

2. **Test Script**:
   - Run `node scripts/test-supabase-auth.js` to test the authentication flow
   - This script tests: sign up, sign in, session management, and sign out

3. **Creating Test Users**:
   - Use the guide in `docs/supabase-test-user-setup.md` for creating test users
   - The most reliable method is creating users directly in the Supabase dashboard
   - You may encounter email rate limits when creating users through the API

## Troubleshooting

### Common Issues

1. **Email Confirmation Required**
   - **Symptom**: Sign-in fails with "Email not confirmed" error
   - **Solution**: Confirm the email in the Supabase dashboard or use the email link

2. **Email Rate Limit**
   - **Symptom**: Sign-up fails with "email rate limit exceeded"
   - **Solution**: Wait at least 1 hour between attempts or use the Supabase dashboard

3. **Invalid Service Role Key**
   - **Symptom**: Admin operations fail with "Invalid API key"
   - **Solution**: 
     - Go to Supabase Dashboard > Project Settings > API
     - Copy the `service_role` key (not the `anon` key)
     - Update your `.env` file with the correct key

4. **Missing Profile Data**
   - **Symptom**: User exists but profile data is missing
   - **Solution**: Check if triggers are set up in `supabase/migrations/20240301_create_profiles_table.sql`

5. **Email Format Validation**
   - **Symptom**: Sign-up fails with email validation errors
   - **Solution**: Use email format `name@domain-name.com`

### Running Diagnostics

If you're having persistent issues, run the diagnostic script:

```bash
node scripts/diagnose-supabase.js
```

This will check:
- Basic connection status
- Authentication access
- Database access
- Service role permissions
- Table existence

## Security Considerations

1. **Sensitive Data**:
   - Sensitive data is encrypted using AES-256-GCM encryption
   - Never store unencrypted sensitive data in the database

2. **Row Level Security**:
   - RLS policies restrict data access to authorized users
   - Always use RLS for production databases

3. **Email Confirmation**:
   - Always require email confirmation in production
   - Email confirmation helps prevent unauthorized access

4. **Service Role Key**:
   - The service role key has admin privileges
   - Never expose it to client-side code
   - Only use it in secure server-side operations

5. **Passwords**:
   - Passwords are securely hashed by Supabase
   - Enforce strong password requirements 