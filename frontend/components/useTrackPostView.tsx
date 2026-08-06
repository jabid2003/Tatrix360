'use client';

import { useEffect } from 'react';

export function useTrackPostView(slug?: string) {
  useEffect(() => {
    if (!slug) return;

    const postSlug = slug;

    async function trackView() {
      try {
        const response = await fetch(
          `/api/posts/${encodeURIComponent(postSlug)}/view`,
          {
            method: 'POST',
            cache: 'no-store',
          }
        );

        const text = await response.text();

        console.log('[view] status:', response.status);
        console.log('[view] response:', text);
      } catch (error) {
        console.error('[view] request failed:', error);
      }
    }

    trackView();
  }, [slug]);
}