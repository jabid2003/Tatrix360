import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';

function getPostHref(post: Post): string | null {
  if (!post.category) return null;
  return `/${post.category.slug}/${post.slug}`;
}

export function HorizontalCard({ post }: { post: Post }) {
  const postHref = getPostHref(post);

  const thumb = (
    <div className="relative h-28 w-28 flex-shrink-0 self-start overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-36">
      {postHref ? (
        <Link href={postHref} className="block h-full w-full" aria-label={`Read: ${post.title}`}>
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
        </Link>
      ) : post.heroImage ? (
        <Image src={post.heroImage} alt={post.title} fill className="object-cover" sizes="(max-width: 144px) 144px, 144px" />
      ) : (
        <div aria-hidden="true" className="h-full w-full bg-muted" />
      )}
      {post.subcategory && post.category && postHref && (
        <Link
          href={`/${post.category.slug}/${post.subcategory.slug}`}
          className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {post.subcategory.name}
        </Link>
      )}
    </div>
  );

  const text = (
    <div className="min-w-0 flex-1">
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
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
          {post.subtitle}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
        {post.author && <span className="font-medium text-foreground/80">{post.author.name}</span>}
        <span>{formatDate(post.publishedAt)}</span>
      </div>
    </div>
  );

  return (
    <article className="group flex min-w-0 items-start gap-3 rounded-lg py-3 transition-colors hover:bg-muted/50 sm:gap-4">
      {thumb}
      {text}
    </article>
  );
}
