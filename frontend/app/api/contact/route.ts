import { NextResponse } from 'next/server';
import { submitContact } from '@/lib/data';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const message = String(body?.message || '').trim();
  const company = String(body?.company || '').trim();

  if (company) return NextResponse.json({ ok: true });
  if (!name || !email || !message) return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  if (message.length > 5000) return NextResponse.json({ error: 'Message too long' }, { status: 400 });

  const result = await submitContact(name, email, message);
  if (!result.ok) {
    console.error('Contact submit failed:', result.error);
    return NextResponse.json({ error: 'Could not submit' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
