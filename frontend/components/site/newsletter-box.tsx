'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useCsrfToken } from '@/hooks/use-csrf';

export function NewsletterBox({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { authedFetch } = useCsrfToken();

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authedFetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (variant === 'compact') {
    return (
      <div className="glass-card relative overflow-hidden rounded-2xl p-5">
        <div className="hero-glow" />
        <div className="relative">
          <h3 className="font-serif text-base font-bold">Stay in the loop</h3>
          <p className="mt-1 text-sm text-muted-foreground">Weekly tech briefing. No spam.</p>
          {status === 'success' ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />You&apos;re subscribed!
            </p>
          ) : (
            <form onSubmit={subscribe} className="mt-3 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-input bg-background/80 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                disabled={status === 'loading'}
                className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
              >
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
          {status === 'error' && <p className="mt-2 text-sm text-destructive">Something went wrong. Try again.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-12">
      <div className="hero-glow" />
      <div className="relative mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight">Never miss a story</h2>
        <p className="mt-2 text-muted-foreground">
          Get the sharpest tech reporting delivered to your inbox every week. No spam, ever.
        </p>
        {status === 'success' ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-lg font-medium text-primary">
            <CheckCircle2 className="h-5 w-5" />You&apos;re subscribed! Check your inbox.
          </p>
        ) : (
          <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-input bg-background/80 px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Subscribe <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-3 text-sm text-destructive">Something went wrong. Please try again.</p>}
      </div>
    </div>
  );
}
