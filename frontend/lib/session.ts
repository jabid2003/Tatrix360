import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = '7d';

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === 'admin';
  } catch {
    // Covers expired tokens, bad signatures, and malformed tokens alike —
    // any failure here just means "not a valid session."
    return false;
  }
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;