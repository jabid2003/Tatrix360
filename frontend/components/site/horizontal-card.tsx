import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';
import { Clock } from 'lucide-react';

function getPostHref(post: Post): string | null {
  if (!post.category) return null;
  return `/${post.category.slug}/${post.slug}`;
}

export function HorizontalCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const content = (
    <>
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-36">
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 144px) 144px, 144px"
            placeholder="blur"
            blurDataURL={getImageBlurUrl(post.heroImage)}
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full bg-muted" />
        )}
        {post.category && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {post.category.name}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-base">
          {post.title}
        </h3>
        {post.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
            {post.subtitle}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
          {post.author && <span className="font-medium text-foreground/80">{post.author.name}</span>}
          <span>{formatDate(post.publishedAt)}</span>
          {post.content && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {estimateReadingTime(post.content)} min
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!postHref) {
    return <article className="flex min-w-0 items-start gap-3 sm:gap-4">{content}</article>;
  }

  return (
    <Link
      href={postHref}
      aria-label={`Read: ${post.title}`}
      className="group flex min-w-0 items-start gap-3 py-3 transition-colors hover:bg-muted/50 rounded-lg sm:gap-4"
    >
      {content}
    </Link>
  );
}
