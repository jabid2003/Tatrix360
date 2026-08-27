import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = '7d';

function getSecretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // During build or when env vars aren't loaded yet, return null
    // instead of throwing — this prevents the middleware from crashing
    // the entire server.
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  const key = getSecretKey();
  if (!key) {
    throw new Error('SESSION_SECRET environment variable is not set.');
  }
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const key = getSecretKey();
  if (!key) {
    // If there's no secret configured, deny all sessions.
    // This prevents unauthorized access when env vars are missing.
    return false;
  }
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
