import { SignJWT, jwtVerify } from 'jose';

const CSRF_SECRET = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET not set');
  return new TextEncoder().encode(secret);
};

const CSRF_EXPIRY = '10m';

export async function generateCsrfToken(): Promise<string> {
  return new SignJWT({ purpose: 'csrf' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(CSRF_EXPIRY)
    .sign(CSRF_SECRET());
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, CSRF_SECRET());
    return payload.purpose === 'csrf';
  } catch {
    return false;
  }
}
