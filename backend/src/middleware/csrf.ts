import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
const csrfTokensMap = new Map<string, string>();

export default function csrf(req: Request, res: Response, next: NextFunction) {
  const token = crypto.randomUUID();
  csrfTokensMap.set(token, 'valid');
  res.cookie('csrf-token', token, {
    httpOnly: true,
    secure: process.env.MODE === 'production',
    sameSite: 'strict',
  });
  next();
}
