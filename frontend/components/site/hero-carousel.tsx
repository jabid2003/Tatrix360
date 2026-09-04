'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';

export function HeroCarousel({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = posts.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(next, 2000);
    return () => clearInterval(id);
  }, [count, next, paused]);

  if (count === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="container-page py-6 sm:py-10">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* Sliding track — smooth auto-slide */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live="polite"
            aria-atomic="true"
          >
            {posts.map((post, i) => {
              const href = post.category ? `/${post.category.slug}/${post.slug}` : '#';
              return (
                <div
                  key={post.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-hidden={i === index ? undefined : true}
                  className="relative h-[300px] w-full flex-shrink-0 sm:h-[400px] lg:h-[480px]"
                >
                  {/* Full image is the clickable link */}
                  <Link href={href} aria-label={`Read: ${post.title}`} className="group absolute inset-0 block">
                    {post.heroImage ? (
                      <Image
                        src={post.heroImage}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 100vw"
                        placeholder="blur"
                        blurDataURL={getImageBlurUrl(post.heroImage)}
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </Link>

                  {/* Text overlay (also clickable via image link above) */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                    {post.subcategory && (
                      <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                        {post.subcategory.name}
                      </span>
                    )}
                    <h1 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl lg:text-balance">
                      {post.title}
                    </h1>
                    {post.subtitle && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-base">
                        {post.subtitle}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70 sm:text-sm">
                      {post.author && <span className="font-medium text-white/90">{post.author.name}</span>}
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide controls */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots + counter */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
