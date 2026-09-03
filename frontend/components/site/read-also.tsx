'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Post } from '@/lib/types';

interface ReadAlsoProps {
  posts: Post[];
}

export function ReadAlso({ posts }: ReadAlsoProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-base font-bold text-foreground">Read Also</h3>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/${post.category?.slug}/${post.slug}`}
            className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-background"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
                {post.title}
              </p>
              {post.subtitle && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {post.subtitle}
                </p>
              )}
              {post.category && (
                <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {post.category.name}
                </span>
              )}
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
