import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from './auth.js';

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'super_secure_jwt_secret_ndce_2026_key';

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = decoded;
  } catch (err) {
    // Silently continue as unauthenticated guest
  }
  next();
};
