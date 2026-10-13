import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-hemophilia-2026-secure-key'
);

export const COOKIE_NAME = 'hemo_session';
const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'OFFICE_USER';
  officeId: string | null;
  officeName?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    officeId: user.officeId,
    officeName: user.officeName || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as 'SUPER_ADMIN' | 'OFFICE_USER',
      officeId: (payload.officeId as string) || null,
      officeName: (payload.officeName as string) || null,
    };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return Promise.resolve(null);
  return verifySessionToken(token);
}

export function authorizeRole(user: SessionUser | null, allowedRoles: ('SUPER_ADMIN' | 'OFFICE_USER')[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function checkOfficeAccess(user: SessionUser | null, targetOfficeId: string): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.officeId === targetOfficeId;
}
