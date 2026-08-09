import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Views and read-time temporarily disabled.
// import { formatDate, formatViews } from '@/lib/utils';
// import { Eye, Clock } from 'lucide-react';

/*
function getReadTime(content?: string): string {
  if (!content) return '5 min';

  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return `${minutes} min`;
}
*/

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Link
        href={`/${post.category?.slug}/${post.slug}`}
        className="relative block h-36 overflow-hidden bg-muted/30 sm:h-52"
      >
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {post.category && (
          <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold text-primary-foreground backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            {post.category.name}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <Link href={`/${post.category?.slug}/${post.slug}`}>
          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-lg">
            {post.title}
          </h3>
        </Link>

        {post.subtitle && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {post.subtitle}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-[10px] text-muted-foreground sm:gap-3 sm:text-xs">
          {post.author && (
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 flex-shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              )}

              <span className="max-w-[80px] truncate font-medium text-foreground/80 sm:max-w-none">
                {post.author.name}
              </span>
            </div>
          )}

          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />

          <span>{formatDate(post.publishedAt)}</span>

          {/*
            Read-time temporarily hidden.

            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />

            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getReadTime(post.content)}
            </span>
          */}

          {/*
            Views temporarily hidden.

            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />

            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(post.views)}
            </span>
          */}
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
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
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
          {/*
            Views temporarily hidden.

            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(post.views)}
            </span>
          */}

          {post.category && (
            <>
              <span className="truncate">{post.category.name}</span>
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

          {/*
            Views temporarily hidden.

            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(post.views)}
            </span>
          */}
        </div>
      </div>
    </Link>
  );
}