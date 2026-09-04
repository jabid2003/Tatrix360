'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden">
          <div className="loading-slide h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      {/* keyed by pathname so content smoothly animates in on every navigation */}
      <div key={pathname} className="page-enter">
        {children}
      </div>
    </>
  );
}
