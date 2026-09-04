'use client';

import { useEffect, useRef, useState } from 'react';
import { PostCard } from '@/components/site/post-card';
import { FadeInWhenVisible } from '@/components/site/fade-in-when-visible';
import type { Post } from '@/lib/types';

const PAGE = 6;

export function LatestPosts({ all }: { all: Post[] }) {
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const shown = all.slice(0, visible);
  const hasMore = visible < all.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisible((v) => v + PAGE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4">
        {shown.map((post, i) => (
          <FadeInWhenVisible key={post.id} delay={i >= visible - PAGE ? (i - (visible - PAGE)) * 50 : 0}>
            <PostCard post={post} />
          </FadeInWhenVisible>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden="true" />}
    </>
  );
}
