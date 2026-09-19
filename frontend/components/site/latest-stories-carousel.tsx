'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  autoSlideMs?: number;
}

export function LatestStoriesCarousel({ stories, autoSlideMs = 2500 }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const total = stories.length;

  const goTo = useCallback((idx: number, dir: 'next' | 'prev') => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % total, 'next');
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total, 'prev');
  }, [current, total, goTo]);

  // Auto-slide
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const id = setInterval(next, autoSlideMs);
    return () => clearInterval(id);
  }, [isPaused, next, autoSlideMs, total]);

  if (total === 0) return null;

  const story = stories[current];
  const href = story.categorySlug ? `/${story.categorySlug}/${story.slug}` : '#';

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Single card */}
      <Link
        href={href}
        className="block"
      >
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl bg-muted sm:aspect-[16/6]">
          {story.thumbnailUrl ? (
            <Image
              src={story.thumbnailUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-700 group-hover/carousel:scale-105"
              sizes="(max-width: 1024px) 100vw, 72rem"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h3 className="font-serif text-lg font-bold leading-tight text-white sm:text-2xl sm:text-balance">
              {story.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-all group-hover/carousel:opacity-100 hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-all group-hover/carousel:opacity-100 hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
