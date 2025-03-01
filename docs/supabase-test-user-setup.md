# Setting Up a Test User in Supabase

When developing with Supabase authentication, you may encounter the following challenges:

1. Email rate limits during testing
2. Email confirmation requirements
3. Need for pre-confirmed test users for development

This guide provides several ways to set up test users for your development environment.

## Option 1: Create a User in the Supabase Dashboard

The most reliable way to create a test user is directly in the Supabase Dashboard:

1. Go to your [Supabase dashboard](https://app.supabase.com)
2. Open your project and navigate to **Authentication > Users**
3. Click the **+ Add User** button
4. Enter the user details:
   - Email: `test_user@example.com` (or any email format you prefer)
   - Password: `TestPassword123!` (or another secure password)
5. After creating the user, find them in the user list
6. Click the three dots (...) menu next to the user and select **Confirm email**
7. The user is now ready to use in your application

## Option 2: Use the Signup Script with Email Rate Limit Handling

If you've hit the email rate limit, wait 1 hour and try the script again:

```bash
node scripts/create-simple-test-user.js
```

After creating the user, you'll still need to confirm their email in the Supabase dashboard as described in Option 1.

## Option 3: Modify Your Supabase Project Settings

For development, you can temporarily disable email confirmation:

1. Go to your [Supabase dashboard](https://app.supabase.com)
2. Open your project and navigate to **Authentication > Providers**
3. In the **Email** provider settings, uncheck **Confirm email**
4. Save your changes
5. Create users using your application's signup flow
6. **IMPORTANT**: Re-enable email confirmation before deploying to production!

## Using the Test User

Once your test user is set up, you can use it to sign in:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test_user@example.com', // Use the email you created
  password: 'TestPassword123!'    // Use the password you set
});
```

## Troubleshooting

If you're experiencing issues with authentication:

1. **Invalid Email Format**: Use the format `name@domain-name.com` 
2. **Email Rate Limits**: Wait at least 1 hour between attempts or use the dashboard
3. **Missing Profile Data**: Check if the `profiles` table exists and the triggers are set up
4. **Wrong Service Role Key**: Double-check your service role key in the `.env` file
5. **RLS Policies**: Ensure your Row Level Security policies are configured correctly

## Security Warning

Test users should ONLY be used in development environments. In production:

- Always enable email confirmation
- Never manually confirm emails for real users
- Ensure proper password requirements are in place
- Implement proper Row Level Security policies 