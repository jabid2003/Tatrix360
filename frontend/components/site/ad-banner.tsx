'use client';

import { Megaphone, ExternalLink, Sparkles, Zap } from 'lucide-react';

// Reusable ad banner — placeholder only, no tracking scripts.
// Props match the requested API: placement, adSize, responsive, adSlot, className
// placement drives default responsive dimensions; adSlot is reserved for GAM/AdSense.

type Placement = 'header' | 'article-top' | 'article-middle' | 'article-bottom' | 'sidebar' | 'footer';

interface AdBannerProps {
  placement?: Placement;
  /** @deprecated use placement instead */
  variant?: 'sidebar' | 'inline';
  adSize?: string;
  responsive?: boolean;
  adSlot?: string;
  className?: string;
}

// Dummy sponsor content — rotate per placement for visual variety
const SPONSORS: Record<Placement, { brand: string; headline: string; cta: string; accent: string }> = {
  header: { brand: 'CloudScale', headline: 'Scale your infrastructure in seconds', cta: 'Start free trial', accent: 'from-violet-600 to-indigo-600' },
  'article-top': { brand: 'NotionAI', headline: 'Write faster with AI', cta: 'Try NotionAI', accent: 'from-cyan-600 to-teal-600' },
  'article-middle': { brand: 'PixelPro', headline: 'Shot on Pixel — see the difference', cta: 'Shop now', accent: 'from-orange-500 to-pink-500' },
  'article-bottom': { brand: 'Linear', headline: 'The issue tracker you will enjoy using', cta: 'Get started', accent: 'from-zinc-800 to-zinc-600' },
  sidebar: { brand: 'Framer', headline: 'Design & ship your dream site', cta: 'Start free', accent: 'from-blue-600 to-violet-600' },
  footer: { brand: 'Vercel', headline: 'Build and deploy on the frontend cloud', cta: 'Deploy now', accent: 'from-zinc-900 to-zinc-700' },
};

function AdLabel({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 ${className}`}>
      <Megaphone className="h-3 w-3" />
      Advertisement
    </p>
  );
}

function SponsorCard({ placement }: { placement: Placement }) {
  const s = SPONSORS[placement];
  return (
    <div className="flex w-full items-center gap-3 sm:gap-4">
      <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm sm:flex ${s.accent}`}>
        <Zap className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{s.brand} • Sponsored</p>
        <p className="truncate text-sm font-semibold leading-tight text-foreground sm:text-[15px]">{s.headline}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90 sm:inline-flex">
        {s.cta} <ExternalLink className="h-3 w-3" />
      </span>
      <span className="shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background sm:hidden">{s.cta}</span>
    </div>
  );
}

export function AdBanner({
  placement,
  variant,
  adSize,
  responsive = true,
  adSlot,
  className = '',
}: AdBannerProps) {
  // Back-compat: variant → placement
  const resolved: Placement = placement ?? (variant === 'sidebar' ? 'sidebar' : variant === 'inline' ? 'article-middle' : 'article-middle');

  // Common outer shell — distinct from editorial, subtle border/bg
  const shell = 'overflow-hidden rounded-xl border border-border bg-card shadow-sm';

  // Size helpers — responsive via Tailwind breakpoints, no horizontal overflow
  // Each placement maps to the spec's px examples via responsive containers that adapt to available width.

  if (resolved === 'header') {
    return (
      <div className={`w-full bg-muted/20 py-2 sm:py-3 ${className}`} aria-label="Advertisement" role="complementary">
        <div className="container-page">
          <AdLabel className="mb-2" />
          <div className={`mx-auto ${shell} bg-gradient-to-br from-muted/30 to-muted/10`}>
            {/* Responsive: 320x50 mobile, 728x90 tablet, 970x90 desktop */}
            <div
              id={adSlot}
              className="mx-auto flex w-full max-w-[320px] items-center justify-center px-3 py-3 sm:max-w-[728px] sm:px-4 sm:py-4 lg:max-w-[970px]"
              style={{ minHeight: responsive ? undefined : adSize ? undefined : undefined }}
            >
              {/* Use SponsorCard on larger, compact on mobile */}
              <div className="hidden w-full sm:block">
                <SponsorCard placement="header" />
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:hidden">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">CloudScale • Sponsored</p>
                    <p className="text-xs font-semibold leading-tight">Scale in seconds</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">Try free</span>
              </div>
            </div>
            <div className="hidden border-t border-border bg-muted/20 px-3 py-1 text-center text-[10px] text-muted-foreground/50 sm:block">
              970 × 90 desktop • 728 × 90 tablet • 320 × 50 mobile — {adSize ?? 'responsive'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resolved === 'sidebar') {
    return (
      <div
        id={adSlot}
        className={`hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:block ${className}`}
        aria-label="Advertisement"
        role="complementary"
      >
        <div className="border-b border-border bg-muted/30 px-3 py-2">
          <AdLabel />
        </div>
        <div className="p-4">
          {/* 300×250 MPU — sticky handled by parent */}
          <div className="mx-auto flex h-[250px] w-full max-w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/40 to-muted/10">
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow">
                <Zap className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Framer • Sponsored</p>
              <p className="mt-1 max-w-[240px] text-sm font-bold leading-tight">Design & ship your dream site</p>
              <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-muted-foreground">Zero code, maximum speed. Trusted by 10k+ teams.</p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                Start free <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <div className="border-t border-border bg-muted/20 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              300 × 250 • Sidebar
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground/50">Ad placeholder — replace with AdSense / GAM unit `{adSlot ?? 'sidebar-mpu'}`</p>
        </div>
      </div>
    );
  }

  if (resolved === 'footer') {
    return (
      <div className={`w-full border-y border-border bg-muted/10 py-6 sm:py-8 ${className}`} aria-label="Advertisement" role="complementary">
        <div className="container-page">
          <AdLabel className="mb-3" />
          <div id={adSlot} className={`${shell} bg-gradient-to-br from-muted/20 to-muted/5`}>
            <div className="mx-auto flex w-full max-w-[970px] items-center justify-center px-4 py-6 sm:py-8">
              <div className="hidden w-full sm:block">
                <SponsorCard placement="footer" />
              </div>
              <div className="w-full sm:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Vercel • Sponsored</p>
                    <p className="truncate text-sm font-semibold">Deploy on the frontend cloud</p>
                  </div>
                </div>
                <span className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                  Deploy now <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
            <div className="border-t border-border bg-muted/20 px-3 py-1.5 text-center text-[10px] text-muted-foreground/50">970 × 250 desktop • 728 × 90 tablet • responsive mobile</div>
          </div>
        </div>
      </div>
    );
  }

  // In-article: article-top | article-middle | article-bottom
  // Spec: desktop 728×90 or 300×250, mobile 320×100 or 300×250, with spacing.
  const isTop = resolved === 'article-top';
  const isBottom = resolved === 'article-bottom';

  return (
    <div
      id={adSlot}
      className={`my-8 ${isTop ? 'mt-6' : ''} ${isBottom ? 'mb-2' : ''} ${className}`}
      aria-label="Advertisement"
      role="complementary"
    >
      <AdLabel className="mb-2" />
      <div className={`${shell} bg-muted/20`}>
        {/* Desktop: 728×90 leaderboard, Mobile: 300×250 / 320×100 */}
        <div className="p-3 sm:p-4">
          {/* Desktop/tablet leaderboard */}
          <div className="hidden w-full sm:block">
            <div className="mx-auto flex h-[90px] w-full max-w-[728px] items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 shadow-sm sm:h-[90px]">
              <SponsorCard placement={resolved} />
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground/40">728 × 90 • In-article {resolved.replace('article-', '')}</p>
          </div>
          {/* Mobile: 300×250 */}
          <div className="sm:hidden">
            <div className="mx-auto flex h-[250px] w-full max-w-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${SPONSORS[resolved].accent}`}>
                <Megaphone className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{SPONSORS[resolved].brand} • Sponsored</p>
              <p className="mt-1 text-sm font-bold leading-tight">{SPONSORS[resolved].headline}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                {SPONSORS[resolved].cta} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground/40">300 × 250 • Mobile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Back-compat alias for old imports: <AdBanner variant="inline" />
export { AdBanner as default };
