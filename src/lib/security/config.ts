// Browser-compatible crypto functions using Web Crypto API
const generateRandomBytes = (length: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(length));
};

export const securityConfig = {
  ssl: {
    enabled: true,
    version: 'TLS 1.3',
    cipherSuites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256'
    ],
    minimumTLSVersion: 'TLSv1.2'
  },
  encryption: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    // Function to generate encryption key using Web Crypto API
    generateKey: async () => {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      return key;
    },
    // Function to generate IV using Web Crypto API
    generateIV: () => generateRandomBytes(12)
  },
  headers: {
    // Headers that will be set via meta tags in the browser
    clientSide: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.plaid.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.stripe.com https://api.stripe.com https://js.stripe.com https://*.supabase.co wss://*.supabase.co https://api.supabase.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.cloudflareinsights.com https://*.plaid.com https://*.projectdcertan84workersdev.workers.dev https://api.ipify.org; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://connect.stripe.com https://buy.stripe.com https://cdn.plaid.com;"
    },
    // Headers that must be set on the server side
    serverSide: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}; 