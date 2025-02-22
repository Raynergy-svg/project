import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { UserService, User } from '../models/User';
import { config } from '../config/config';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export interface SignUpData {
  email: string;
  name: string;
  password: string;
  subscriptionId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const AuthService = {
  async signup(data: SignUpData) {
    const existingUser = await UserService.findByEmail(data.email);
    if (existingUser) {
      throw new AuthenticationError('Email already registered');
    }

    const hashedPassword = await hash(data.password, 12);
    
    const user = await UserService.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      subscriptionId: data.subscriptionId,
    });

    const token = this.generateToken(user);
    return { user, token };
  },

  async login(data: LoginData) {
    const user = await UserService.findByEmail(data.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValidPassword = await compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = this.generateToken(user);
    return { user, token };
  },

  generateToken(user: User) {
    return sign(
      { 
        userId: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus 
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
  },

  verifyToken(token: string) {
    try {
      const decoded = verify(token, config.jwt.secret);
      return decoded as { userId: string; email: string; subscriptionStatus: string };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  },
}; 