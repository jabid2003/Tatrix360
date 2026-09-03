'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Twitter, Github, Zap, Mail, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCsrfToken } from '@/hooks/use-csrf';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { authedFetch } = useCsrfToken();

  async function subscribe(e: React.FormEvent) {
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
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      {/* Newsletter Banner — only place with subscribe form */}
      <div id="footer-newsletter" className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              Never miss a story
            </h2>
            <p className="mt-2 text-muted-foreground">
              Get the sharpest tech reporting delivered to your inbox every week. No spam, ever.
            </p>
            {status === 'success' ? (
              <p className="mt-5 flex items-center justify-center gap-2 text-lg font-medium text-primary">
                <CheckCircle2 className="h-5 w-5" />You&apos;re subscribed! Check your inbox.
              </p>
            ) : (
              <form onSubmit={subscribe} className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Subscribe <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-destructive">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </span>
              <span className="text-base font-bold text-foreground">
                <span>Tatrix</span>
                <span className="text-primary">360</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Independent tech reporting on AI, gadgets, and the platforms that shape our digital lives.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Link href="https://twitter.com" aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-3.5 w-3.5" />
              </Link>
              <Link href="https://github.com" aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
                <Github className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Sections</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/ai" className="transition-colors hover:text-foreground">AI</Link></li>
              <li><Link href="/category/android" className="transition-colors hover:text-foreground">Android</Link></li>
              <li><Link href="/category/ios" className="transition-colors hover:text-foreground">iOS</Link></li>
              <li><Link href="/category/gadgets" className="transition-colors hover:text-foreground">Gadgets</Link></li>
              <li><Link href="/category/deals" className="transition-colors hover:text-foreground">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
              <li><Link href="/subscribe" className="transition-colors hover:text-foreground">Newsletter</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Subscribe</h4>
            <p className="mt-3 text-sm text-muted-foreground">Weekly tech briefing, no spam.</p>
            <Link
              href="/subscribe"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Join free
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Tatrix360. Tech, decoded.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with care for readers who care about tech.
          </p>
        </div>
      </div>
    </footer>
  );
}
