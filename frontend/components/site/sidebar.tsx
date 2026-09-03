'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { TrendingCard } from '@/components/site/post-card';
import { CategoryTruncate } from '@/components/site/category-truncate';
import { AdBanner } from '@/components/site/ad-banner';

interface SidebarLink {
  label: string;
  href: string;
}

interface SidebarProps {
  trending?: Post[];
  links?: SidebarLink[];
  linkTitle?: string;
}

export function Sidebar({ trending = [], links, linkTitle }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      {/* Trending */}
      {trending.length > 0 && (
        <div className="card rounded-2xl p-5">
          <h3 className="mb-2 section-label">New Articles</h3>
          <div className="divide-y divide-border">
            {trending.slice(0, 5).map((post, i) => (
              <TrendingCard key={post.id} post={post} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Ad — Sidebar 300x250 (sticky on desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        <AdBanner placement="sidebar" adSlot="sidebar-mpu" />
      </div>

      {/* Categories with mobile truncation */}
      {links && links.length > 0 && (
        <CategoryTruncate links={links} linkTitle={linkTitle ?? 'Categories'} mobileLimit={4} />
      )}
    </aside>
  );
}
