export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPostBySlug, getPosts } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { NewsletterBox } from '@/components/site/newsletter-box';
import { CompactCard } from '@/components/site/post-card';
import { PostViewTracker } from '@/components/PostViewTracker';

import { ArrowLeft } from 'lucide-react';

// Views, read-time and share icon temporarily disabled.
// import { Eye, Clock, ArrowLeft, Share2 } from 'lucide-react';

// export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts({ pageSize: 50 });

  return posts.map((p) => ({
    category: p.category?.slug || 'uncategorized',
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.subtitle,
    openGraph: {
      title: post.title,
      description: post.subtitle,
      images: post.heroImage ? [{ url: post.heroImage }] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const [post, related] = await Promise.all([
    getPostBySlug(params.slug),
    getPosts({ pageSize: 6 }),
  ]);

  if (!post) notFound();

  const relatedPosts = related
    .filter(
      (p) =>
        p.slug !== post.slug &&
        p.category?.slug === post.category?.slug
    )
    .slice(0, 3);

  return (
    <article className="container-page py-6 sm:py-10">
      {/* View tracking remains active for future use */}
      <PostViewTracker slug={post.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title,
            datePublished: post.publishedAt,
            author: post.author
              ? {
                  '@type': 'Person',
                  name: post.author.name,
                }
              : undefined,
            image: post.heroImage ? [post.heroImage] : undefined,
          }),
        }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground animate-in-up stagger-1">
        <Link
          href="/"
          className="transition-colors hover:text-foreground"
        >
          Home
        </Link>

        <span>/</span>

        <Link
          href={`/category/${post.category?.slug}`}
          className="transition-colors hover:text-foreground"
        >
          {post.category?.name}
        </Link>
      </nav>

      {/* Article header */}
      <div className="mx-auto max-w-3xl">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="inline-block animate-in-up stagger-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="mt-4 animate-in-up stagger-2 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:text-balance">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="mt-4 animate-in-up stagger-3 text-lg text-muted-foreground lg:text-xl lg:text-pretty">
            {post.subtitle}
          </p>
        )}

        {/* Author + meta */}
        <div className="mt-6 flex flex-wrap animate-in-up stagger-4 items-center gap-4 border-y border-border py-4">
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
                <p className="text-sm font-semibold text-foreground">
                  {post.author.name}
                </p>

                {post.author.role && (
                  <p className="text-xs text-muted-foreground">
                    {post.author.role}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.publishedAt)}</span>

            {/*
              Read-time temporarily hidden.

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                5 min read
              </span>
            */}

            {/*
              Views temporarily hidden.

              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views ?? 0}
              </span>
            */}
          </div>
        </div>
      </div>

      {/* Hero image */}
      {post.heroImage && (
        <div className="mx-auto mt-8 max-w-4xl animate-in-up stagger-4 overflow-hidden rounded-3xl bg-muted/30 p-3 sm:p-4">
          <Image
            src={post.heroImage}
            alt={post.title}
            width={1200}
            height={800}
            className="h-auto w-full rounded-2xl"
            sizes="(max-width: 768px) 100vw, 56rem"
            priority
          />
        </div>
      )}

      {/* Article body */}
      {post.content && (
        <div className="prose-article mx-auto mt-10 max-w-3xl animate-in-up stagger-5 text-lg leading-relaxed">
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="mt-8 font-serif text-2xl font-bold tracking-tight"
                >
                  {line.slice(3)}
                </h2>
              );
            }

            if (line.startsWith('- ')) {
              return (
                <li key={i} className="ml-6 list-disc">
                  {line.slice(2)}
                </li>
              );
            }

            if (line.trim() === '') return null;

            return (
              <p key={i} className="mt-4">
                {line}
              </p>
            );
          })}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="mx-auto mt-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            Related stories
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {relatedPosts.map((p) => (
              <CompactCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <div className="mx-auto mt-16 max-w-4xl">
        <NewsletterBox />
      </div>
    </article>
  );
}