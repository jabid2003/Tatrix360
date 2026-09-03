'use client';

import { useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/site/post-card';
import { LoadMoreButton } from '@/components/site/load-more-button';

interface SubcategoryPageClientProps {
  initialPosts: Post[];
  total: number;
  subcategorySlug: string;
}

export function SubcategoryPageClient({ initialPosts, total, subcategorySlug }: SubcategoryPageClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < total);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/subcategory?slug=${encodeURIComponent(subcategorySlug)}&page=${nextPage}&pageSize=3`
      );
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setPage(nextPage);
      setHasMore((data.posts?.length ?? 0) >= 3);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, subcategorySlug]);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
        <p className="text-muted-foreground">No articles in this subcategory yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} />
    </div>
  );
}