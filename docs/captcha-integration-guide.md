# Captcha Integration Guide for SmartDebtFlow

This guide explains how to properly integrate captcha verification with Supabase authentication in SmartDebtFlow.

## Overview

We've configured Supabase to use hCaptcha for authentication flows to protect your site from bots and automated attacks. This requires:

1. Configuring Supabase to work with captcha
2. Adding captcha verification to your frontend
3. Passing the captcha token with authentication requests

## Configuration

### Supabase Configuration

The captcha is enabled in the Supabase configuration file (`supabase/config.toml`):

```toml
[auth.captcha]
enabled = true
provider = "hcaptcha"
secret = "env(SUPABASE_AUTH_CAPTCHA_SECRET)"
```

For development, use the hCaptcha test credentials:
- Site Key: `10000000-ffff-ffff-ffff-000000000001`
- Secret: `0x0000000000000000000000000000000000000000`

For production, you need to:
1. Create an account at [hCaptcha](https://www.hcaptcha.com/)
2. Register your website
3. Obtain your site key and secret
4. Update your environment variables

### Frontend Integration

We're using the `@hcaptcha/react-hcaptcha` package to integrate captcha in the frontend. Here's how it's implemented:

```tsx
import HCaptcha from '@hcaptcha/react-hcaptcha';

const HCAPTCHA_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001'; // Replace with actual key in production

const YourAuthComponent = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };
  
  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };
  
  // In your render method:
  return (
    <form>
      {/* Other form elements */}
      
      <HCaptcha
        sitekey={HCAPTCHA_SITE_KEY}
        onVerify={handleCaptchaVerify}
        onExpire={handleCaptchaExpire}
      />
      
      <button type="submit" disabled={!captchaToken}>Submit</button>
    </form>
  );
};
```

### Authentication Requests

When making authentication requests to Supabase, include the captcha token:

```tsx
// For sign-up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    captchaToken: captchaToken,
    // Other options...
  }
});

// For sign-in
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
  options: {
    captchaToken: captchaToken
  }
});
```

## Local Development

For local development, use the provided script to set up the environment:

```bash
# Run the setup script
chmod +x setup-captcha.sh
./setup-captcha.sh
```

This will:
1. Set the environment variable for the captcha secret
2. Restart Supabase with the new configuration

## Troubleshooting

### Common Issues

1. **"Captcha verification process failed"** - Ensure you're:
   - Using the correct site key in your frontend
   - Passing the token correctly in the options
   - Setting the SUPABASE_AUTH_CAPTCHA_SECRET environment variable

2. **Captcha not appearing** - Check:
   - The hCaptcha React component is installed
   - Your network allows access to hCaptcha domains
   - There are no console errors related to hCaptcha

3. **Token not being verified** - Make sure:
   - You're using the same captcha provider in Supabase config as in frontend
   - The secret is correctly set in the environment
   - The token hasn't expired (they expire after 2 minutes)

## Production Deployment

When deploying to production:

1. Update your environment variables with the actual hCaptcha secret
2. Update the site key in your frontend code
3. Configure your CI/CD pipeline to set the SUPABASE_AUTH_CAPTCHA_SECRET

For enhanced security, consider:
- Using reCAPTCHA Enterprise or hCaptcha Enterprise 
- Enabling additional captcha settings like invisible captcha
- Monitoring captcha success/failure rates for unusual patterns 