import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/sections';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';

export type ArticleCardItem = Pick<
  Article,
  'id' | 'title' | 'slug' | 'thumbnailUrl' | 'createdAt'
> & {
  categorySlug: string;
};

export function ArticleCard({ article }: { article: ArticleCardItem }) {
  const href = `/${article.categorySlug}/${article.slug}`;

  return (
    <article className="group card card-hover flex min-w-0 flex-col overflow-hidden">
      <div className="relative block aspect-[16/10] min-h-0 bg-muted p-0.5 sm:aspect-auto sm:h-44">
        <Link href={href} aria-label={`Read: ${article.title}`} className="flex h-full w-full items-center justify-center">
          {article.thumbnailUrl ? (
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={getImageBlurUrl(article.thumbnailUrl)}
              width={400}
              height={250}
            />
          ) : (
            <div aria-hidden="true" className="h-full w-full bg-muted" />
          )}
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-base">
            {article.title}
          </h3>
        </Link>
        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[10px] text-muted-foreground sm:text-xs">
          <span className="whitespace-nowrap">{formatDate(article.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
