# hCaptcha Production Setup for SmartDebtFlow

This guide outlines the steps taken to integrate hCaptcha with your Supabase authentication system and provides instructions for maintaining the setup in production.

## Current Configuration

The hCaptcha integration has been successfully set up with your production keys:

- **Site Key**: `0x4AAAAAAA_KNHY49GyF-yvh`
- **Secret Key**: `0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4`

These keys have been configured as follows:

1. **Frontend Configuration**:
   - The site key is set in `src/utils/captcha.ts`
   - The React component `<HCaptcha>` is implemented in the authentication forms

2. **Backend Configuration**:
   - The secret key is set via the `SUPABASE_AUTH_CAPTCHA_SECRET` environment variable
   - Supabase is configured to use hCaptcha in `supabase/config.toml`

## Production Deployment Checklist

When deploying to production, ensure the following:

### 1. Environment Variables

Make sure your production environment has the captcha secret key set:

```bash
SUPABASE_AUTH_CAPTCHA_SECRET=0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4
```

### 2. Configuration Files

Ensure the production configuration in `supabase/config.toml` includes:

```toml
[auth.captcha]
enabled = true
provider = "hcaptcha"
secret = "env(SUPABASE_AUTH_CAPTCHA_SECRET)"
```

### 3. Frontend Code

Verify the site key is correctly set in `src/utils/captcha.ts`:

```typescript
export const HCAPTCHA_SITE_KEY = '0x4AAAAAAA_KNHY49GyF-yvh';
```

## Testing the Configuration

To test that hCaptcha is working correctly:

1. Navigate to http://localhost:3001/auth-demo in your browser
2. Test authentication flows with the hCaptcha integration
3. Check Supabase logs to verify the captcha verification is working correctly

## Troubleshooting

If you encounter issues with the hCaptcha integration:

1. Verify that the `SUPABASE_AUTH_CAPTCHA_SECRET` environment variable is set correctly
2. Check that the site key in `src/utils/captcha.ts` is correct
3. Ensure the Supabase captcha configuration is enabled in `supabase/config.toml`
4. Check that the hCaptcha widget is rendering correctly in the browser
5. Use browser developer tools to check for any network or JavaScript errors

## Additional Resources

- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase captcha integration guide](https://supabase.com/docs/guides/auth/auth-captcha)

---

This setup provides a robust protection against bot sign-ups while maintaining a smooth user experience for legitimate users. 