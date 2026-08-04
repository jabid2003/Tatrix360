import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/data';

export async function POST(req: Request) {
  let email: string;
  try { email = String((await req.json())?.email || '').trim().toLowerCase(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });

  const result = await subscribeEmail(email);
  if (!result.ok) {
    console.error('Newsletter submit failed:', result.error);
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
