import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { SessionUser } from '@/types';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'hallsanr-super-secure-secret-key-azure-2025';
export const COOKIE_NAME = 'hallsanr_session';

const DEFAULT_OWNER_USER = process.env.OWNER_USERNAME || 'hall';
const DEFAULT_OWNER_PASS = process.env.OWNER_PASSWORD || 'hall1234';

export function signSessionToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  let token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return null;
  return verifySessionToken(token);
}

export async function verifyOwnerCredentials(username: string, password: string): Promise<boolean> {
  const targetUser = DEFAULT_OWNER_USER;
  const targetPass = DEFAULT_OWNER_PASS;

  if (username.trim().toLowerCase() !== targetUser.trim().toLowerCase()) {
    return false;
  }

  // Check if targetPass is bcrypt hashed
  if (targetPass.startsWith('$2a$') || targetPass.startsWith('$2b$')) {
    return bcrypt.compare(password, targetPass);
  }

  // Direct comparison
  return password === targetPass;
}
