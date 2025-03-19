import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.AUTH_SECRET!,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.AUTH_SECRET!,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.AUTH_SECRET!) as { userId: string };
    
    const token = jwt.sign(
      { userId: decoded.userId },
      process.env.AUTH_SECRET!,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    res.json({ token });
  } catch (error) {
    next(new ApiError(401, 'Invalid refresh token'));
  }
});

export default router;
