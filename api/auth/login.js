// Vercel Edge Function for authentication
import { createClient } from "@supabase/supabase-js";
import { withRateLimit } from '../../src/utils/rate-limit';

// Server-side Supabase client with service role key
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create an isolated Supabase client for the API
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Original handler function
async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Process the login with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }

    // Log successful login
    console.log(`Successful login for ${normalizedEmail}`);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Unexpected login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(loginHandler, 'login');
