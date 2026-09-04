'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== displayPath) {
      setIsLoading(true);
      const t = setTimeout(() => {
        setDisplayPath(pathname);
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [pathname, displayPath]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden">
          <div className="loading-slide h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      <div key={displayPath} className="page-enter">
        {children}
      </div>
    </>
  );
}
