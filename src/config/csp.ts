export const getCSP = (supabaseUrl: string) => {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'style-src-elem': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      supabaseUrl,
      'https://raw.githubusercontent.com'
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'connect-src': [
      "'self'",
      supabaseUrl,
      `${supabaseUrl}/functions/v1/*`,
      'https://api.supabase.com',
      'wss://*.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    'frame-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"]
  };

  // Convert directives object to CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return cspString;
}; 