import { Megaphone } from 'lucide-react';

type Placement = 'leaderboard' | 'in-article' | 'sidebar' | 'bottom-banner';

interface AdBannerProps {
  placement: Placement;
  adSlot?: string;
  className?: string;
}

const DIMENSIONS: Record<Placement, { desktop: string; mobile: string; minHeight: string }> = {
  leaderboard:  { desktop: '970×90',  mobile: '320×50',  minHeight: 'min-h-[90px]' },
  'in-article': { desktop: '728×90',  mobile: '300×250', minHeight: 'min-h-[90px]' },
  sidebar:      { desktop: '300×600', mobile: '300×250', minHeight: 'min-h-[250px] lg:min-h-[600px]' },
  'bottom-banner': { desktop: '970×90', mobile: '320×50', minHeight: 'min-h-[90px]' },
};

function AdLabel() {
  return (
    <p className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      <Megaphone className="h-3 w-3" />
      Advertisement
    </p>
  );
}

export function AdBanner({ placement, adSlot, className = '' }: AdBannerProps) {
  const dim = DIMENSIONS[placement];

  if (placement === 'leaderboard' || placement === 'bottom-banner') {
    return (
      <section
        className={`w-full border-b border-border bg-muted/10 ${className}`}
        aria-label="Advertisement"
        role="complementary"
      >
        <div className="container-page py-2 sm:py-3">
          <AdLabel />
          <div
            id={adSlot}
            className={`mx-auto flex w-full max-w-[970px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 ${dim.minHeight}`}
            style={{ contain: 'layout' }}
          >
            {/* Desktop: 970×90, Tablet: 728×90, Mobile: 320×50 */}
            <div className="hidden w-full sm:block">
              <div className="mx-auto flex h-[90px] w-full max-w-[728px] items-center justify-center lg:max-w-[970px]">
                <p className="text-xs text-muted-foreground/40">{dim.desktop}</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-center sm:hidden">
              <div className="flex h-[50px] w-full max-w-[320px] items-center justify-center">
                <p className="text-[10px] text-muted-foreground/40">{dim.mobile}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (placement === 'sidebar') {
    return (
      <div
        id={adSlot}
        className={`overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/10 ${dim.minHeight} ${className}`}
        aria-label="Advertisement"
        role="complementary"
        style={{ contain: 'layout' }}
      >
        <div className="flex h-full min-h-[250px] flex-col items-center justify-center p-6 lg:min-h-[600px]">
          <Megaphone className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/40">Advertisement</p>
          <p className="mt-1 text-[10px] text-muted-foreground/30">{dim.desktop}</p>
        </div>
      </div>
    );
  }

  // In-article: 728×90 desktop, 300×250 mobile
  return (
    <div
      id={adSlot}
      className={`my-8 overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/10 ${className}`}
      aria-label="Advertisement"
      role="complementary"
      style={{ contain: 'layout' }}
    >
      <AdLabel />
      {/* Desktop: 728×90 leaderboard */}
      <div className="hidden sm:block">
        <div className="mx-auto flex h-[90px] w-full max-w-[728px] items-center justify-center">
          <p className="text-xs text-muted-foreground/40">{dim.desktop}</p>
        </div>
      </div>
      {/* Mobile: 300×250 */}
      <div className="flex sm:hidden">
        <div className="mx-auto flex h-[250px] w-full max-w-[300px] items-center justify-center">
          <p className="text-[10px] text-muted-foreground/40">{dim.mobile}</p>
        </div>
      </div>
    </div>
  );
}

export { AdBanner as default };
