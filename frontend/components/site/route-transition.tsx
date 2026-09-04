'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname !== displayPath) {
      setIsLoading(true);
      setProgress(0);

      // Animate progress bar from 0% → 90% over 1.8s
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 50;
        // Fast start, slow finish (logarithmic)
        const p = Math.min(90, 100 * (1 - Math.exp(-elapsed / 500)));
        setProgress(p);
        if (elapsed >= 1800) clearInterval(interval);
      }, 50);

      timerRef.current = setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setDisplayPath(pathname);
          setIsLoading(false);
          setProgress(0);
        }, 200);
      }, 2000);

      return () => {
        clearInterval(interval);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [pathname, displayPath]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-primary/5">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-none"
            style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
          />
        </div>
      )}
      <div key={displayPath} className="page-enter">
        {children}
      </div>
    </>
  );
}
