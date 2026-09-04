import { Sparkles, ExternalLink } from 'lucide-react';

// Sidebar ad — 300×250 MPU format for desktop sidebar placement.
export function SideBySideAd() {
  return (
    <div aria-label="Advertisement" role="complementary">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        <Sparkles className="h-3 w-3" />
        Sponsored
      </p>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col items-center p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">CloudScale · Sponsored</p>
          <p className="mt-1 text-sm font-bold leading-tight text-foreground">Launch your SaaS on a global edge</p>
          <p className="mt-1 text-xs text-muted-foreground">CDN, analytics, and hosting in one.</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90">
            Get started <ExternalLink className="h-3 w-3" />
          </span>
        </div>
        <div className="border-t border-border bg-muted/20 py-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground/50">
          300 × 250 · Sidebar
        </div>
      </div>
    </div>
  );
}
