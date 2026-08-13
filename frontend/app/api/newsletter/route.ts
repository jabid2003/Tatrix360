import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/data';

export async function POST(req: Request) {
  let email: string;

  try {
    const body = await req.json();
    email = String(body?.email || '').trim().toLowerCase();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'A valid email is required' },
      { status: 400 }
    );
  }

  try {
    const result = await subscribeEmail(email);

    if (!result.ok) {
      console.error('Newsletter submit failed:', result.error);

      return NextResponse.json(
        {
          error: 'Could not subscribe',
          detail: result.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : String(error);

    console.error('Newsletter route crashed:', detail);

    return NextResponse.json(
      {
        error: 'Newsletter server error',
        detail,
      },
      { status: 500 }
    );
  }
}