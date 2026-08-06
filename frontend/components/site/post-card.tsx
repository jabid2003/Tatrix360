import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { formatDate, formatViews } from '@/lib/utils';
import { Eye, Clock } from 'lucide-react';

function getReadTime(content?: string): string {
  if (!content) return '5 min';

  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return `${minutes} min`;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Link
        href={`/${post.category?.slug}/${post.slug}`}
        className="relative overflow-hidden bg-muted/30"
      >
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            width={800}
            height={500}
            className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {post.category.name}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/${post.category?.slug}/${post.slug}`}>
          <h3 className="font-serif text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>

        {post.subtitle && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.subtitle}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs text-muted-foreground">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
                />
              )}

              <span className="font-medium text-foreground/80">
                {post.author.name}
              </span>
            </div>
          )}

          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span>{formatDate(post.publishedAt)}</span>

          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getReadTime(post.content)}
          </span>

          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(post.views)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function CompactCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/${post.category?.slug}/${post.slug}`}
      className="group flex items-start gap-3 py-3"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted/30">
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt=""
            width={64}
            height={64}
            className="h-full w-full transition-transform duration-300 group-hover:scale-110"
            sizes="64px"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h4>

        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(post.views)}
          </span>

          {post.category && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{post.category.name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function TrendingCard({
  post,
  rank,
}: {
  post: Post;
  rank: number;
}) {
  return (
    <Link
      href={`/${post.category?.slug}/${post.slug}`}
      className="group flex items-start gap-4 py-3"
    >
      <span className="font-serif text-2xl font-bold text-muted-foreground/30 transition-colors group-hover:text-primary">
        {String(rank).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h4>

        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(post.publishedAt)}</span>

          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(post.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}