import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';

function getPostHref(post: Post): string | null {
  if (!post.category) return null;
  return `/${post.category.slug}/${post.slug}`;
}

export function PostCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const media = (
    <div className={`relative block aspect-[16/10] min-h-0 bg-muted p-0.5 sm:aspect-auto sm:h-44 ${postHref ? 'group' : ''}`}>
      {postHref ? (
        <Link href={postHref} aria-label={`Read: ${post.title}`} className="flex h-full w-full items-center justify-center">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.title}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={getImageBlurUrl(post.heroImage)}
              width={400}
              height={250}
            />
          ) : (
            <div aria-hidden="true" className="h-full w-full bg-muted" />
          )}
        </Link>
      ) : (
        post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            className="max-h-full max-w-full object-contain"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
            width={400}
            height={250}
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full bg-muted" />
        )
      )}
    </div>
  );

  return (
    <article className="group card card-hover flex min-w-0 flex-col overflow-hidden">
      {media}

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        {postHref ? (
          <Link href={postHref}>
            <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-base">
              {post.title}
            </h3>
          </Link>
        ) : (
          <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug tracking-tight sm:text-base">
            {post.title}
          </h3>
        )}

        {post.subtitle && (
          <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            {post.subtitle}
          </p>
        )}

        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[10px] text-muted-foreground sm:gap-3 sm:text-xs">
          {post.author && (
            <div className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={18}
                  height={18}
                  className="h-4 w-4 flex-shrink-0 rounded-full object-cover ring-1 ring-border sm:h-[18px] sm:w-[18px]"
                />
              )}
              <span className="max-w-[80px] truncate font-medium text-foreground/80 sm:max-w-none">
                {post.author.name}
              </span>
            </div>
          )}
          {post.author && (
            <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
          )}
          <span className="whitespace-nowrap">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function CompactCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const content = (
    <>
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted p-0.5">
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="56px"
            width={56}
            height={56}
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full bg-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {postHref ? (
          <Link href={postHref}>
            <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug transition-colors group-hover:text-primary">
              {post.title}
            </h4>
          </Link>
        ) : (
          <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug">{post.title}</h4>
        )}
      </div>
    </>
  );

  return (
    <article className="flex min-w-0 items-start gap-3 py-3">
      {content}
    </article>
  );
}

export function TrendingCard({ post, rank }: { post: Post; rank: number }) {
  const postHref = getPostHref(post);

  const content = (
    <>
      <span aria-hidden="true" className="flex-shrink-0 font-serif text-xl font-bold text-muted-foreground transition-colors group-hover:text-primary">
        {String(rank).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h4>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </>
  );

  if (!postHref) {
    return <div className="flex min-w-0 items-start gap-4 py-3">{content}</div>;
  }

  return (
    <Link href={postHref} aria-label={`Read: ${post.title}`} className="group flex min-w-0 items-start gap-4 py-3">
      {content}
    </Link>
  );
}
