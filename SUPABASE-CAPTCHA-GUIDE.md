# hCaptcha Integration with Supabase Authentication

This guide provides detailed instructions for integrating hCaptcha with Supabase authentication in a React/Vite application.

## Overview

Integrating hCaptcha with Supabase authentication adds an extra layer of security to your application by protecting against automated bot attacks. This integration requires:

1. Configuration of Supabase Auth settings
2. Frontend implementation with the hCaptcha React component
3. Proper handling of captcha tokens during sign-up and sign-in operations

## Configuration Steps

### 1. Supabase Configuration

First, you need to configure Supabase to enable external captcha verification:

1. Edit your `supabase/config.toml` file to include these settings:

```toml
[auth.external_captcha]
provider = "hcaptcha" 
secret = "env.SUPABASE_AUTH_CAPTCHA_SECRET"
```

2. Create an environment variable for the captcha secret:

```bash
# For local development
export SUPABASE_AUTH_CAPTCHA_SECRET="0x0000000000000000000000000000000000000000"

# For production, use your real hCaptcha secret key
```

3. Restart your Supabase instance:

```bash
cd supabase
supabase stop
supabase start
```

### 2. Frontend Implementation

#### 2.1 Install the hCaptcha React component:

```bash
npm install @hcaptcha/react-hcaptcha --save
```

#### 2.2 Create a utility file for captcha functionality:

In `src/utils/captcha.ts`:

```typescript
// Default test key - replace with your real site key for production
export const HCAPTCHA_SITE_KEY = "10000000-ffff-ffff-ffff-000000000001";

// Function to verify if captcha token exists
export const verifyCaptchaPresent = (captchaToken: string | null): boolean => {
  return !!captchaToken;
};

// More complex verification if needed
export const validateCaptchaToken = (token: string): boolean => {
  // For test mode, any non-empty token is valid
  // In production, you might want to add more validation logic here
  return token.length > 0;
};
```

#### 2.3 Modify your authentication component:

In your authentication component (e.g., `SupabaseAuthTest.tsx`):

```tsx
import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../lib/supabaseClient';
import { HCAPTCHA_SITE_KEY, verifyCaptchaPresent } from '../utils/captcha';

// ... existing component code

// Add a state for the captcha token
const [captchaToken, setCaptchaToken] = useState<string | null>(null);
const captchaRef = useRef<HCaptcha | null>(null);

// Handler for captcha verification
const handleCaptchaVerify = (token: string) => {
  setCaptchaToken(token);
};

// Modify your sign-up function
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate captcha
  if (!verifyCaptchaPresent(captchaToken)) {
    setError('Please complete the captcha verification');
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captchaToken,
      },
    });
    
    if (error) throw error;
    
    // Reset captcha after successful or failed submission
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
    
    // Handle successful signup
    // ...
  } catch (error) {
    // Handle error
    // ...
  }
};

// In your render method, add the HCaptcha component
<HCaptcha
  sitekey={HCAPTCHA_SITE_KEY}
  onVerify={handleCaptchaVerify}
  ref={captchaRef}
/>
```

## Verification

To verify that your hCaptcha integration is working correctly:

1. Run the verification script:

```bash
node verify-captcha-integration.js
```

2. Check the browser at `http://localhost:3000/test-auth`
   - Verify that you see the hCaptcha widget on both sign-up and sign-in forms

3. Test user signup with captcha:
   - Fill out the sign-up form
   - Complete the captcha verification
   - Submit the form

4. Verify email delivery in Inbucket:
   - Visit http://localhost:54324 to see if confirmation emails are sent

## Troubleshooting

### Common Issues

1. **Captcha verification failed**
   - Check that the `SUPABASE_AUTH_CAPTCHA_SECRET` environment variable is set
   - Verify that the hCaptcha site key in your frontend matches the expected test key
   - Ensure Supabase was restarted after configuration changes

2. **hCaptcha widget not appearing**
   - Check console for JavaScript errors
   - Verify that the `@hcaptcha/react-hcaptcha` package is installed
   - Ensure the component is properly imported and rendered

3. **Email sending failures**
   - Check that email templates are properly configured
   - Verify that SMTP settings are correct if using external email service

## Production Deployment

For production deployment:

1. Register for a real hCaptcha account at https://www.hcaptcha.com/
2. Replace the test site key in your frontend code
3. Update the `SUPABASE_AUTH_CAPTCHA_SECRET` environment variable with your real secret key
4. Test the integration thoroughly in a staging environment before deploying to production

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [hCaptcha React Component](https://github.com/hCaptcha/react-hcaptcha) 