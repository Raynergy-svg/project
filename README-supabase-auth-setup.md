# Supabase Authentication Setup for SmartDebtFlow

This document provides a comprehensive guide for setting up and configuring Supabase authentication for SmartDebtFlow, with a focus on email-based authentication using the email address `no-reply@smartdebtflow.com`.

## Configuration Overview

We've configured Supabase authentication with the following features:

1. **Custom Email Templates**: Professional-looking email templates for account confirmations, password resets, and invitations
2. **Sender Configuration**: All emails will be sent from `no-reply@smartdebtflow.com`
3. **Enhanced Security**: Email confirmation required, secure password changes enabled

## Local Development Setup

For local development, the authentication settings are defined in `supabase/config.toml`. The key changes include:

1. **Email Configuration**:
   - Enabled email confirmations
   - Set secure password change
   - Configured SMTP settings with the no-reply email

2. **Custom Email Templates**:
   - Created HTML templates for all authentication emails
   - Templates are located in `supabase/templates/`

To use these settings locally:

1. Set the SMTP password environment variable:
   ```bash
   export SMTP_PASSWORD=your_smtp_password
   ```

2. Restart the Supabase instance:
   ```bash
   supabase stop && supabase start
   ```

3. Access the email testing interface at http://localhost:54324 to view sent emails

## Production Setup

For production, you need to apply these settings to your Supabase project. We've provided a Node.js script to help with this:

1. **Using the Setup Script**:
   ```bash
   cd supabase
   SUPABASE_ACCESS_TOKEN=your_token SUPABASE_PROJECT_ID=your_project_id SMTP_PASSWORD=your_password node setup-email-templates.js
   ```

2. **Manual Setup**:
   - Go to the Supabase Dashboard → Authentication → Email Templates
   - Copy the HTML from the template files to the respective templates
   - Configure the SMTP settings with your email provider's details

## Email Provider Setup

To use `no-reply@smartdebtflow.com` as the sender email, you need to:

1. Configure your email provider (e.g., SendGrid, Mailgun, AWS SES) to allow sending from this address
2. Verify domain ownership and set up proper SPF, DKIM, and DMARC records for your domain
3. Update the SMTP settings in Supabase with the provider's credentials

## Testing Authentication

After setup, test the authentication flow:

1. **Sign Up Test**:
   - Create a new account and check if the confirmation email is sent
   - Verify the email comes from `no-reply@smartdebtflow.com`
   - Confirm the account using the link in the email

2. **Password Reset Test**:
   - Try the "Forgot Password" flow
   - Check that the reset email is sent with the correct template

## Troubleshooting

If you encounter issues:

1. **Emails Not Sending**:
   - Check SMTP credentials
   - Verify your email provider allows sending from `no-reply@smartdebtflow.com`
   - Check for rate limits on your email provider

2. **Template Issues**:
   - Verify the paths in `config.toml` are correct
   - Make sure all template variables are properly formatted

3. **Authentication Flow Problems**:
   - Check the Supabase logs for auth-related errors
   - Verify your site URL and redirect URLs are properly configured

## Security Recommendations

For enhanced security:

1. **Password Requirements**: Consider updating the password requirements in the config
2. **Session Management**: Configure session timeouts appropriately
3. **SMTP Security**: Use environment variables for SMTP credentials, never hardcode them
4. **Access Control**: Implement proper Row Level Security (RLS) policies for your database

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Template Variables Reference](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli) 