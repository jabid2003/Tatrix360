import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

export async function GET() {
  const token = await generateCsrfToken();
  return NextResponse.json({ token });
}
