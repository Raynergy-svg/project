import { Request, Response, NextFunction } from 'express';
import { supabase, createSupabaseClientWithToken } from '../supabase';

/**
 * Middleware to authenticate user based on JWT token
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Add user ID to request body for controllers to use
    req.body.userId = user.id;
    
    // Create a Supabase client with the user's token for row-level security
    const userSupabase = createSupabaseClientWithToken(token);
    
    // Add the client to the request for controllers to use
    (req as any).supabaseClient = userSupabase;
    
    // Continue to the next middleware or controller
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}; 