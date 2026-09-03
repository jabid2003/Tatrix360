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
        <div className="fixed inset-x-0 top-16 z-[60] h-0.5 overflow-hidden">
          <div className="h-full w-full origin-left animate-loading-bar bg-gradient-to-r from-primary via-cyan-400 to-primary" />
        </div>
      )}
      <div className="animate-in-fade">{children}</div>
    </>
  );
}
