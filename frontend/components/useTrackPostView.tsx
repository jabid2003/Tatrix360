'use client';

import { useEffect } from 'react';

export function useTrackPostView(slug?: string) {
  useEffect(() => {
    if (!slug) return;

    async function trackView() {
      try {
        await fetch(
          `/api/posts/${encodeURIComponent(slug!)}/view`,
          {
            method: 'POST',
            cache: 'no-store',
          }
        );
      } catch {
        // Silently ignore failed view tracking
      }
    }

    trackView();
  }, [slug]);
}