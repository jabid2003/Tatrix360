'use client';

import Link from 'next/link';
import type { Post } from '@/lib/types';

interface ReadAlsoProps {
  posts: Post[];
}

export function ReadAlso({ posts }: ReadAlsoProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-6 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">Read also: </span>
      {posts.map((post, i) => (
        <span key={post.id}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link
            href={`/${post.category?.slug}/${post.slug}`}
            className="text-muted-foreground underline underline-offset-2 hover:text-primary"
          >
            {post.title}
          </Link>
        </span>
      ))}
    </div>
  );
}
