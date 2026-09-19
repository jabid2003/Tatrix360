'use client';

import { useState } from 'react';
import { PostCard } from '@/components/site/post-card';
import { ArticleCard, type ArticleCardItem } from '@/components/site/article-card';
import { LoadMoreButton } from '@/components/site/load-more-button';
import type { Post } from '@/lib/types';

interface ApiPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  heroImage: string | null;
  publishedAt: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  author: { name: string; avatar?: string | null; slug?: string | null } | null;
}

interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  categorySlug: string | null;
  categoryName: string | null;
}

function toPost(p: ApiPost): Post {
  return {
    id: Number(p.id) || 0,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle ?? undefined,
    heroImage: p.heroImage ?? undefined,
    publishedAt: p.publishedAt ?? undefined,
    category: p.categorySlug
      ? { id: 0, name: p.categoryName ?? p.categorySlug, slug: p.categorySlug }
      : undefined,
    author: p.author
      ? { id: 0, name: p.author.name, slug: p.author.slug ?? '', avatar: p.author.avatar ?? undefined }
      : undefined,
  };
}

function toArticleCard(a: ApiArticle): ArticleCardItem {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl ?? undefined,
    createdAt: a.publishedAt ?? a.createdAt ?? undefined,
    categorySlug: a.categorySlug ?? '',
  };
}

interface Props {
  initialPosts?: Post[];
  initialArticles?: ArticleCardItem[];
  total: number;
  pageSize?: number;
  source?: 'posts' | 'articles';
}

export function LatestFeed({
  initialPosts = [],
  initialArticles = [],
  total,
  pageSize = 6,
  source = 'posts',
}: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [articles, setArticles] = useState<ArticleCardItem[]>(initialArticles);
  const [offset, setOffset] = useState(pageSize);
  const [loading, setLoading] = useState(false);
  const hasMore = (source === 'articles' ? articles.length : posts.length) < total;

  async function handleLoadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/latest?limit=${pageSize}&offset=${offset}&source=${source}`);
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.items)) return;
      if (source === 'articles') {
        const fresh = (data.items as ApiArticle[]).map(toArticleCard);
        setArticles((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...fresh.filter((a) => !seen.has(a.id))];
        });
      } else {
        const fresh = (data.items as ApiPost[]).map(toPost);
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...fresh.filter((p) => !seen.has(p.id))];
        });
      }
      setOffset((o) => o + pageSize);
    } catch {
      // silently ignore network errors; button can be retried
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = source === 'articles' ? articles.length === 0 : posts.length === 0;
  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
        <p className="text-muted-foreground">No latest stories found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {source === 'articles'
          ? articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          : posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
      </div>
      <LoadMoreButton onClick={handleLoadMore} loading={loading} hasMore={hasMore} />
    </>
  );
}