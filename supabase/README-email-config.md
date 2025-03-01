# Supabase Email Configuration for SmartDebtFlow

This document explains how to configure the email settings for authentication in your Supabase project.

## Email Templates

The email templates for authentication are located in the `supabase/templates` directory:

- `confirmation.html`: Email template for account confirmation
- `recovery.html`: Email template for password reset
- `invite.html`: Email template for invitations

These templates use the default Supabase variables:
- `{{ .ConfirmationURL }}` - For confirmation emails
- `{{ .RecoveryURL }}` - For password reset emails
- `{{ .InviteURL }}` - For invitation emails

## Local Development Configuration

For local development, the email configuration is defined in `supabase/config.toml`. The relevant sections are:

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
secure_password_change = true

[auth.email.smtp]
enabled = true
host = "smtp.your-email-provider.com"
port = 587
user = "no-reply@smartdebtflow.com"
pass = "env(SMTP_PASSWORD)"
admin_email = "admin@smartdebtflow.com"
sender_name = "SmartDebtFlow"

[auth.email.template.invite]
subject = "You've been invited to SmartDebtFlow"
content_path = "./templates/invite.html"

[auth.email.template.confirmation]
subject = "Confirm Your SmartDebtFlow Account"
content_path = "./templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset Your SmartDebtFlow Password"
content_path = "./templates/recovery.html"
```

To use this configuration:

1. Replace `smtp.your-email-provider.com` with your actual SMTP server
2. Set the environment variable `SMTP_PASSWORD` with your SMTP password:

```bash
export SMTP_PASSWORD=your_smtp_password
```

## Production Configuration

For production, you need to configure the email settings in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Email Templates
3. Configure each template (Confirmation, Recovery, Invite) with the content from the HTML files
4. Set the email subjects as defined in the config.toml file
5. Navigate to Authentication > Email Settings
6. Configure the SMTP settings with:
   - SMTP Host: Your SMTP server
   - SMTP Port: 587 (or as required by your provider)
   - SMTP Username: no-reply@smartdebtflow.com
   - SMTP Password: Your SMTP password
   - Sender Name: SmartDebtFlow

## Troubleshooting

If emails are not being sent:

1. Check the SMTP credentials and ensure they are correct
2. Verify that your SMTP server allows sending from the specified email address
3. Check if there are any rate limits on your SMTP provider
4. For local development, check the email testing interface at http://localhost:54324

## Additional Configuration

To enable additional features:

1. For password requirements: Update the `password_requirements` setting
2. For session management: Configure the `auth.sessions` section
3. For multi-factor authentication: Update the `auth.mfa` section

## Security Considerations

- Do not commit sensitive credentials like SMTP passwords to your repository
- Use environment variables for all sensitive information
- Regularly rotate your SMTP credentials
- Monitor for failed authentication attempts and suspicious activity 