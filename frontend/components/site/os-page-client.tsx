'use client';

import { useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import { FilterButtons } from '@/components/site/filter-buttons';
import { HorizontalCard } from '@/components/site/horizontal-card';
import { LoadMoreButton } from '@/components/site/load-more-button';

const OS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: 'Windows', value: 'windows' },
  { label: 'macOS', value: 'macos' },
  { label: 'Linux', value: 'linux' },
  { label: 'Other', value: 'other-os' },
];

interface OSPageClientProps {
  initialPosts: { tag: string; tagName: string; posts: Post[] }[];
}

export function OSPageClient({ initialPosts }: OSPageClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [posts, setPosts] = useState<Post[]>(
    initialPosts.flatMap((g) => g.posts)
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleFilterChange = useCallback(async (value: string) => {
    setActiveFilter(value);
    setPage(1);
    setLoading(true);

    try {
      if (value === 'all') {
        const allPosts = initialPosts.flatMap((g) => g.posts);
        setPosts(allPosts);
        setHasMore(true);
      } else {
        const res = await fetch(
          `/api/posts/tag?tag=${value}&page=1&pageSize=3`
        );
        const data = await res.json();
        setPosts(data.posts ?? []);
        setHasMore((data.posts?.length ?? 0) < (data.total ?? 0));
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [initialPosts]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoading(true);

    try {
      const tagParam = activeFilter === 'all' ? '' : `&tag=${activeFilter}`;
      const res = await fetch(
        `/api/posts/tag?page=${nextPage}&pageSize=3${tagParam}`
      );
      const data = await res.json();

      if (activeFilter === 'all') {
        setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      } else {
        setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      }

      setPage(nextPage);
      setHasMore((data.posts?.length ?? 0) > 0);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <FilterButtons
        items={OS_FILTERS}
        active={activeFilter}
        onChange={handleFilterChange}
      />

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-28 w-28 flex-shrink-0 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">No articles found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-1 divide-y divide-border">
          {posts.map((post) => (
            <HorizontalCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} />
      )}
    </div>
  );
}
