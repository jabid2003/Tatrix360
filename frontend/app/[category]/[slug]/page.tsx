import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getPostByCategoryAndSlug, getPosts, getPostsByIds, getSubcategoriesByCategory } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';
import { CompactCard } from '@/components/site/post-card';
import { PostViewTracker } from '@/components/PostViewTracker';
import ArticleActions from '@/components/article-actions';
import { ReadAlso } from '@/components/site/read-also';
import { AdBanner } from '@/components/site/ad-banner';
import { ArticleSidebar } from '@/components/site/article-sidebar';

import { ArrowLeft } from 'lucide-react';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts({ pageSize: 50 });

  return posts
    .filter((p) => !!p.category)
    .map((p) => ({
      category: p.category!.slug,
      slug: p.slug,
    }));
}

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

  const postCategories =
    post.categories && post.categories.length > 0
      ? post.categories
      : post.category
        ? [post.category]
        : [];

  const related = post.category
    ? await getPosts({ categorySlug: post.category.slug, pageSize: 6 })
    : [];

  const relatedPosts = related
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);

  const readAlsoPosts = post.readAlsoIds && post.readAlsoIds.length > 0
    ? await getPostsByIds(post.readAlsoIds)
    : [];

  const relatedSubMenus = post.category
    ? await getSubcategoriesByCategory(post.category.slug)
    : [];

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

  const contentLines = post.content ? post.content.split('\n') : [];
  const midpoint = Math.floor(contentLines.length / 2);

  // Find paragraph 3 index (3rd non-empty, non-heading line)
  let paragraphCount = 0;
  let adInsertIndex = -1;
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    if (line.trim() === '' || line.startsWith('## ') || line.startsWith('- ')) continue;
    paragraphCount++;
    if (paragraphCount === 3) {
      adInsertIndex = i + 1;
      break;
    }
  }

  return (
    <>
      {/* AD SLOT 1: TOP BANNER — already rendered in layout.tsx */}

      <article className="container-page py-6 sm:py-10">
        <PostViewTracker slug={post.slug} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href={`/category/${post.category?.slug}`} className="transition-colors hover:text-foreground">
            {post.category?.name}
          </Link>
        </nav>

        {/* Hero image — full-bleed with text overlay */}
        {post.heroImage && (
          <>
            {/* Desktop hero — 2:1 landscape */}
            <div className="relative mx-auto hidden aspect-[2/1] w-full max-w-3xl overflow-hidden rounded-2xl border border-border lg:block">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48rem"
                placeholder="blur"
                blurDataURL={getImageBlurUrl(post.heroImage)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                <div className="max-w-2xl">
                  {post.category && (
                    <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                      {post.category.name}
                    </span>
                  )}
                  <h1 className="font-serif text-2xl font-bold leading-tight text-white lg:text-3xl lg:text-balance">
                    {post.title}
                  </h1>
                  {post.subtitle && (
                    <p className="mt-2 max-w-xl text-xs text-white/80 lg:text-sm">
                      {post.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/80 lg:text-sm">
                    {post.author && <span className="font-medium text-white/90">{post.author.name}</span>}
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile hero — 3:4 portrait */}
            <div className="relative mx-auto block aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-border lg:hidden">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 80vw, 24rem"
                placeholder="blur"
                blurDataURL={getImageBlurUrl(post.heroImage)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="max-w-sm">
                  {post.category && (
                    <span className="mb-2 inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      {post.category.name}
                    </span>
                  )}
                  <h1 className="font-serif text-2xl font-bold leading-tight text-white">
                    {post.title}
                  </h1>
                  {post.subtitle && (
                    <p className="mt-2 text-xs text-white/80">
                      {post.subtitle}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/80">
                    {post.author && <span className="font-medium text-white/90">{post.author.name}</span>}
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No-hero fallback */}
        {!post.heroImage && (
          <div className="mx-auto max-w-3xl">
            {postCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postCategories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="badge-primary">
                    {cat.name}
                  </Link>
                ))}
              </div>
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
                    <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
                    {post.author.role && <p className="text-xs text-muted-foreground">{post.author.role}</p>}
                  </div>
                </div>
              )}
              <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Article actions + category badges */}
        <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between">
          {postCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {postCategories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="badge-primary">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <ArticleActions title={post.title} description={post.subtitle} />
        </div>

        {/* ═══ MAIN 2-COLUMN GRID ═══ */}
        <div className="mx-auto mt-8 flex max-w-6xl gap-8">

          {/* ── LEFT COLUMN: Main Content (75%) ── */}
          <main className="min-w-0 flex-1" role="main">

            {/* AD SLOT 2: IN-CONTENT AD — between paragraphs 3-4 */}
            <div className="mx-auto max-w-3xl">
              <AdBanner placement="in-article" adSlot="in-content-1" />
            </div>

            {/* Article body */}
            {post.content && (
              <div className="prose-article mx-auto mt-8 max-w-3xl text-lg leading-relaxed">
                {contentLines.map((line, i) => {
                  // Insert ReadAlso at midpoint
                  if (i === midpoint && readAlsoPosts.length > 0) {
                    return <ReadAlso key="read-also" posts={readAlsoPosts} />;
                  }

                  // Render line
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="mt-8 font-serif text-2xl font-bold tracking-tight">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>;
                  }
                  if (line.trim() === '') return null;
                  return <p key={i} className="mt-4">{line}</p>;
                })}

                {readAlsoPosts.length > 0 && midpoint >= contentLines.length && (
                  <ReadAlso posts={readAlsoPosts} />
                )}
              </div>
            )}

            {/* Tags / Read more */}
            {(post.tags?.length || relatedSubMenus.length || post.category) && (
              <section className="mx-auto mt-10 max-w-3xl border-t border-border pt-8" aria-label="Read more">
                <p className="section-label mb-4">Read more</p>
                <div className="flex flex-wrap gap-2.5">
                  {post.category && (
                    <Link href={`/category/${post.category.slug}`} className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                      {post.category.name}
                    </Link>
                  )}
                  {relatedSubMenus.map((sub) => (
                    <Link key={sub.id} href={`/category/${post.category!.slug}/${sub.slug}`} className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                      {sub.name}
                    </Link>
                  ))}
                  {post.tags?.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`} className="inline-flex items-center rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Article Bottom Ad */}
            <div className="mx-auto mt-8 max-w-3xl">
              <AdBanner placement="in-article" adSlot="article-bottom" />
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </main>

          {/* ── RIGHT COLUMN: Sidebar (25%) ── */}
          <ArticleSidebar trending={relatedPosts} />
        </div>

        {/* Related stories */}
        {relatedPosts.length > 0 && (
          <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-10">
            <h2 className="font-serif text-xl font-bold tracking-tight">Related stories</h2>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4">
              {relatedPosts.map((p) => (
                <CompactCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
