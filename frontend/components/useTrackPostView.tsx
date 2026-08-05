'use client';

import { useEffect } from 'react';

export function useTrackPostView(slug?: string) {
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/posts/${slug}/view`, {
      method: 'POST',
    }).catch(() => {});
  }, [slug]);
}