// components/PostViewTracker.tsx
'use client';

import { useTrackPostView } from '@/components/useTrackPostView';

export function PostViewTracker({ slug }: { slug: string }) {
  useTrackPostView(slug);
  return null;
}