'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, TrendingUp } from 'lucide-react';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { AdBanner } from '@/components/site/ad-banner';

interface ArticleSidebarProps {
  trending?: Post[];
}

export function ArticleSidebar({ trending = [] }: ArticleSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-28 flex flex-col gap-6">
        {/* Popular Posts */}
        {trending.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Popular Posts</h3>
            </div>
            <div className="divide-y divide-border">
              {trending.slice(0, 5).map((post, i) => (
                <Link
                  key={post.id}
                  href={`/${post.category?.slug}/${post.slug}`}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{post.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(post.publishedAt)}</p>
                  </div>
                  {post.heroImage && (
                    <Image
                      src={post.heroImage}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">Stay updated</h3>
          <p className="mt-1 text-xs text-muted-foreground">Get the latest tech stories delivered to your inbox. No spam.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Join
            </button>
          </div>
        </div>

        {/* Sticky Skyscraper Ad — 300×600 */}
        <AdBanner placement="sidebar" adSlot="sidebar-skyscraper" />
      </div>
    </aside>
  );
}
