'use client';

import { useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import { HorizontalCard } from '@/components/site/horizontal-card';
import { LoadMoreButton } from '@/components/site/load-more-button';

const TAB_TO_TYPE: Record<string, string> = {
  news: 'News',
  top: 'Review',
  reviews: 'Review',
  opinions: 'Opinion',
};

interface LaptopPageClientProps {
  initialPosts: { type: string; posts: Post[] }[];
}

export function LaptopPageClient({ initialPosts }: LaptopPageClientProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState<Post[]>(
    initialPosts.flatMap((g) => g.posts)
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleTabChange = useCallback(async (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setLoading(true);

    try {
      if (tab === 'all') {
        setPosts(initialPosts.flatMap((g) => g.posts));
        setHasMore(true);
      } else {
        const postType = TAB_TO_TYPE[tab];
        const res = await fetch(
          `/api/posts/type?type=${encodeURIComponent(postType ?? tab)}&page=1&pageSize=3`
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
      const postType = TAB_TO_TYPE[activeTab];
      const typeParam = activeTab === 'all' ? '' : `&type=${encodeURIComponent(postType ?? activeTab)}`;
      const res = await fetch(
        `/api/posts/type?page=${nextPage}&pageSize=3${typeParam}`
      );
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setPage(nextPage);
      setHasMore((data.posts?.length ?? 0) > 0);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-nav tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-border">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {Object.keys(TAB_TO_TYPE).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
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
          <p className="text-muted-foreground">No articles found.</p>
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
