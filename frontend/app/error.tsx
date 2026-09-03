'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-16 text-center">
      <h2 className="font-serif text-2xl font-bold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}