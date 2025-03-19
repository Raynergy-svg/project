import { Request, Response } from 'express';
import { AuthService, AuthenticationError } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';

export const AuthController = {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name, planId } = req.body;

      // Create user account
      const { user, token } = await AuthService.signup({
        email,
        password,
        name,
      });

      // If a plan is selected, create a checkout session
      if (planId) {
        const checkoutSession = await SubscriptionService.createCheckoutSession(planId, user.id);
        return res.status(201).json({
          user,
          token,
          checkoutUrl: checkoutSession.url,
        });
      }

      return res.status(201).json({ user, token });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login({ email, password });
      return res.status(200).json({ user, token });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = AuthService.verifyToken(token);
      return res.status(200).json({ valid: true, user: decoded });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
}; 