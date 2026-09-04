'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Mail, Send } from 'lucide-react';
import { useCsrfToken } from '@/hooks/use-csrf';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { authedFetch } = useCsrfToken();

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authedFetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
        {status === 'success' ? (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold">You&apos;re subscribed!</h2>
            <p className="mt-2 text-muted-foreground">
              Check your inbox to confirm. The weekly briefing is on its way.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight sm:text-3xl">Never miss a story</h2>
            <p className="mt-2 text-muted-foreground">
              Get the sharpest tech reporting delivered to your inbox every week. No spam, ever.
            </p>
            <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Subscribe</>}
              </button>
            </form>
            {status === 'error' && (
              <p className="mt-3 text-sm text-destructive">Something went wrong. Please try again.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Join thousands of readers. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}