'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or head back to the
        homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary/30 hover:shadow-soft"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
