'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  createdAt?: string;
  categorySlug?: string;
}

interface Props {
  stories: Story[];
}

export function LatestStoriesSection({ stories }: Props) {
  if (stories.length === 0) return null;

  const items = stories.slice(0, 4);

  return (
    <section className="container-page py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold tracking-tight">Latest stories</h2>
        <Link
          href="/latest"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((story) => {
          const href = story.categorySlug ? `/${story.categorySlug}/${story.slug}` : '#';
          return (
            <Link key={story.id} href={href} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                {story.thumbnailUrl ? (
                  <Image
                    src={story.thumbnailUrl}
                    alt={story.title}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <h3 className="mt-2 line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-primary">
                {story.title}
              </h3>
            </Link>
          );
        })}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide sm:hidden -mx-5 px-5">
        {items.map((story) => {
          const href = story.categorySlug ? `/${story.categorySlug}/${story.slug}` : '#';
          return (
            <Link key={story.id} href={href} className="group block flex-shrink-0 w-[45%] min-w-[160px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                {story.thumbnailUrl ? (
                  <Image
                    src={story.thumbnailUrl}
                    alt={story.title}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    sizes="45vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <h3 className="mt-2 line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-primary">
                {story.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
