import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getPostByCategoryAndSlug, getPosts } from '@/lib/data';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';
import { NewsletterBox } from '@/components/site/newsletter-box';
import { CompactCard } from '@/components/site/post-card';
import { PostViewTracker } from '@/components/PostViewTracker';
import ArticleActions from '@/components/article-actions';

import { ArrowLeft, Clock } from 'lucide-react';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts({ pageSize: 50 });

  return posts
    .filter((p) => !!p.category)
    .map((p) => ({
      category: p.category!.slug,
      slug: p.slug,
    }));
}

export const fallback = 'blocking';

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const result = await getPostByCategoryAndSlug(params.category, params.slug);

  if (result.status === 'not-found') {
    return {};
  }

  const post = result.post;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://tatrix360.com';

  const canonicalCategory = post.category?.slug ?? params.category;

  const articleUrl = new URL(
    `/${canonicalCategory}/${params.slug}`,
    siteUrl
  ).toString();

  const description =
    post.seoDescription ||
    post.subtitle ||
    `Read ${post.title} on Tatrix360.`;

  const imageUrl = post.heroImage
    ? new URL(post.heroImage, siteUrl).toString()
    : undefined;

  return {
    title: post.seoTitle || post.title,
    description,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: post.title,
      description,
      url: articleUrl,
      siteName: 'Tatrix360',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const result = await getPostByCategoryAndSlug(params.category, params.slug);

  if (result.status === 'not-found') {
    notFound();
  }

  if (result.status === 'wrong-category') {
    redirect(`/${result.correctCategorySlug}/${params.slug}`);
  }

  const post = result.post;

  const related = post.category
    ? await getPosts({ categorySlug: post.category.slug, pageSize: 6 })
    : [];

  const relatedPosts = related
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.seoDescription || post.subtitle || undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com'}/${post.category?.slug}/${params.slug}`,
    },
    author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Tatrix360',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com',
    },
    image: post.heroImage ? [post.heroImage] : undefined,
  };

  return (
    <article className="container-page py-6 sm:py-10">
      <PostViewTracker slug={post.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href={`/category/${post.category?.slug}`} className="transition-colors hover:text-foreground">
          {post.category?.name}
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="badge-primary"
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:text-balance">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="mt-4 text-lg text-muted-foreground lg:text-xl lg:text-pretty">
            {post.subtitle}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
          {post.author && (
            <div className="flex items-center gap-3">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
                {post.author.role && (
                  <p className="text-xs text-muted-foreground">{post.author.role}</p>
                )}
              </div>
            </div>
          )}
          <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.publishedAt)}</span>
            {post.content && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {estimateReadingTime(post.content)} min read
              </span>
            )}
          </div>
        </div>
      </div>

      {post.heroImage && (
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-border bg-muted p-2 sm:p-3">
          <Image
            src={post.heroImage}
            alt={post.title}
            width={1200}
            height={800}
            className="h-auto w-full rounded-xl"
            sizes="(max-width: 768px) 100vw, 56rem"
            priority
            placeholder="blur"
            blurDataURL={getImageBlurUrl(post.heroImage)}
          />
        </div>
      )}

      <div className="mx-auto mt-4 flex max-w-4xl justify-end">
        <ArticleActions title={post.title} description={post.subtitle} />
      </div>

      {post.content && (
        <div className="prose-article mx-auto mt-10 max-w-3xl text-lg leading-relaxed">
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="mt-8 font-serif text-2xl font-bold tracking-tight">
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>
              );
            }
            if (line.trim() === '') return null;
            return <p key={i} className="mt-4">{line}</p>;
          })}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag.id} className="badge">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mx-auto mt-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-10">
          <h2 className="font-serif text-xl font-bold tracking-tight">Related stories</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {relatedPosts.map((p) => (
              <CompactCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto mt-16 max-w-4xl">
        <NewsletterBox />
      </div>
    </article>
  );
}
