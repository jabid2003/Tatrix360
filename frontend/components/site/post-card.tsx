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

// Returns null when the post has no category, rather than falling back to
// a fake '/uncategorized/...' path. That fallback used to produce a
// clickable card whose link always resolves to not-found, since
// getPostByCategoryAndSlug treats a missing category as unroutable by
// design (same rule the sitemap already follows). Callers below render a
// non-interactive card instead of a dead link when this is null.
function getPostHref(post: Post): string | null {
  if (!post.category) return null;
  return `/${post.category.slug}/${post.slug}`;
}

export function PostCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const media = (
    <div
      className={`relative block aspect-[4/3] min-h-0 overflow-hidden bg-muted/30 sm:aspect-auto sm:h-52 ${
        postHref ? 'group' : ''
      }`}
    >
      {post.heroImage ? (
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-full w-full bg-muted"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {post.category && (
        <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold text-primary-foreground backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
          {post.category.name}
        </span>
      )}
    </div>
  );

  return (
    <article className="group card-hover flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {postHref ? (
        <Link href={postHref} aria-label={`Read: ${post.title}`}>
          {media}
        </Link>
      ) : (
        media
      )}

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        {postHref ? (
          <Link href={postHref}>
            <h3 className="line-clamp-2 break-words font-serif text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-lg">
              {post.title}
            </h3>
          </Link>
        ) : (
          <h3 className="line-clamp-2 break-words font-serif text-sm font-bold leading-snug tracking-tight sm:text-lg">
            {post.title}
          </h3>
        )}

        {post.subtitle && (
          <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            {post.subtitle}
          </p>
        )}

        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-4 text-[10px] text-muted-foreground sm:gap-3 sm:text-xs">
          {post.author && (
            <div className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 flex-shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              )}

              <span className="max-w-[90px] truncate font-medium text-foreground/80 sm:max-w-none">
                {post.author.name}
              </span>
            </div>
          )}

          {post.author && (
            <span
              aria-hidden="true"
              className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40"
            />
          )}

          <span className="whitespace-nowrap">
            {formatDate(post.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function CompactCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const content = (
    <>
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
          <div
            aria-hidden="true"
            className="h-full w-full bg-muted"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h4>

        {post.category && (
          <div className="mt-1 min-w-0 text-xs text-muted-foreground">
            <span className="block truncate">
              {post.category.name}
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (!postHref) {
    return (
      <div className="flex min-w-0 items-start gap-3 py-3">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={postHref}
      aria-label={`Read: ${post.title}`}
      className="group flex min-w-0 items-start gap-3 py-3"
    >
      {content}
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
  const postHref = getPostHref(post);

  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex-shrink-0 font-serif text-2xl font-bold text-muted-foreground/30 transition-colors group-hover:text-primary"
      >
        {String(rank).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h4>

        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {formatDate(post.publishedAt)}
          </span>
        </div>
      </div>
    </>
  );

  if (!postHref) {
    return (
      <div className="flex min-w-0 items-start gap-4 py-3">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={postHref}
      aria-label={`Read: ${post.title}`}
      className="group flex min-w-0 items-start gap-4 py-3"
    >
      {content}
    </Link>
  );
}