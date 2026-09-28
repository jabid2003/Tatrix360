import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getPostByCategoryAndSlug, getPosts, getPostsByIds } from '@/lib/data';
import {
  getMainCategoryBySlug,
  getSectionByCategoryAndSlug,
  getArticleBySlug,
  getArticlesBySection,
  getArticlesByIds,
} from '@/lib/sections';
import { formatDate } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';
import { CompactCard } from '@/components/site/post-card';
import { ArticleCard, type ArticleCardItem } from '@/components/site/article-card';
import { SectionGrid } from '@/components/site/section-grid';
import { PostViewTracker } from '@/components/PostViewTracker';
import ArticleActions from '@/components/article-actions';
import { ReadAlso } from '@/components/site/read-also';
import { AdBanner } from '@/components/site/ad-banner';
import { ArticleSidebar } from '@/components/site/article-sidebar';
import { ListicleArticle } from '@/components/site/listicle-article';
import { getArticleItems } from '@/lib/article-items';
import { getProductsByIds, type Product } from '@/lib/products';
import { RelatedProducts } from '@/components/site/related-products';

import { ArrowLeft, ChevronRight } from 'lucide-react';

export const revalidate = 60;
export const dynamicParams = true;
// Force dynamic: the root layout reads request headers (x-is-admin), so
// on-demand static prerendering of unlisted paths throws DYNAMIC_SERVER_USAGE
// in production (dev never prerenders, which is why this only failed on Vercel).
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const posts = await getPosts({ pageSize: 50 });
    return posts
      .filter((p) => !!p.category)
      .map((p) => ({
        category: p.category!.slug,
        slug: p.slug,
      }));
  } catch {
    return [];
  }
}

function toCardItem(
  a: { id: string; title: string; slug: string; thumbnailUrl?: string; createdAt?: string },
  categorySlug: string
): ArticleCardItem {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl,
    createdAt: a.createdAt,
    categorySlug,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  // New architecture first: section detail or new article.
  const mainCat = await getMainCategoryBySlug(params.category).catch(() => null);
  if (mainCat) {
    const found = await getSectionByCategoryAndSlug(params.category, params.slug).catch(() => null);
    if (found) {
      return {
        title: `${found.section.title} — ${found.category.displayName}`,
        description: `Latest ${found.section.title} stories in ${found.category.displayName} on Tatrix360.`,
      };
    }
    const article = await getArticleBySlug(params.slug).catch(() => null);
    if (article && article.mainCategoryId === mainCat.id) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com';
      const description = article.content ? `${article.content.slice(0, 155)}…` : `Read ${article.title} on Tatrix360.`;
      return {
        title: article.title,
        description,
        alternates: { canonical: `/${mainCat.slug}/${article.slug}` },
        openGraph: {
          title: article.title,
          description,
          url: `/${mainCat.slug}/${article.slug}`,
          siteName: 'Tatrix360',
          type: 'article',
          images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, alt: article.title }] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description,
          images: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
        },
      };
    }
  }

  // Legacy post fallback.
  const result = await getPostByCategoryAndSlug(params.category, params.slug).catch(() => null);

  if (!result || result.status === 'not-found') {
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
  // ── New architecture: section detail page ──────────────────────────────
  const mainCat = await getMainCategoryBySlug(params.category).catch(() => null);
  if (mainCat) {
    const found = await getSectionByCategoryAndSlug(params.category, params.slug).catch(() => null);
    if (found) {
      const { articles, total } = await getArticlesBySection(found.section.id, 6, 0).catch(() => ({ articles: [], total: 0 }));
      const items = articles.map((a) => toCardItem(a, found.category.slug));
      return (
        <main className="container-page py-8">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${found.category.slug}`} className="transition-colors hover:text-foreground">
              {found.category.displayName}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{found.section.title}</span>
          </nav>

          <header className="mb-8">
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              {found.section.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {found.category.displayName} · {total} {total === 1 ? 'article' : 'articles'}
            </p>
          </header>

          {items.length > 0 ? (
            <SectionGrid
              categorySlug={found.category.slug}
              categoryName={found.category.displayName}
              sectionId={found.section.id}
              sectionTitle={found.section.title}
              sectionSlug={found.section.slug}
              initialArticles={items}
              total={total}
              pageSize={6}
              showViewAll={false}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
              <p className="text-muted-foreground">No articles in this section yet.</p>
            </div>
          )}
        </main>
      );
    }

    // ── New architecture: article page ───────────────────────────────────
    const article = await getArticleBySlug(params.slug).catch(() => null);
    if (article && article.mainCategoryId === mainCat.id) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com';
      const articleStructuredData = {
        '@context': 'https://schema.org',
        '@type': article.articleType === 'listicle' ? 'ItemList' : 'NewsArticle',
        headline: article.title,
        description: article.seoDescription || article.subtitle || undefined,
        datePublished: article.publishedAt || article.createdAt,
        dateModified: article.updatedAt || article.publishedAt || article.createdAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteUrl}/${mainCat.slug}/${article.slug}`,
        },
        author: article.author ? { '@type': 'Person', name: article.author.name } : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'Tatrix360',
          url: siteUrl,
        },
        image: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
      };

      // If it's a listicle, delegate to the dedicated listicle component
      if (article.articleType === 'listicle') {
        const items = await getArticleItems(article.id, false).catch(() => []);
        // Resolve linked spec products (same product reusable across articles).
        // Live product data fills gaps; typed fields always win.
        const linkedIds = items.map((i) => i.productId).filter((x): x is string => !!x);
        const linkedList = linkedIds.length > 0 ? await getProductsByIds(linkedIds).catch(() => []) : [];
        const linkedMap: Record<string, Product> = Object.fromEntries(linkedList.map((p) => [p.id, p]));
        const displayItems = items.map((item) => {
          const prod = item.productId ? linkedMap[item.productId] : undefined;
          if (!prod) return item;
          const hasSpecs = item.specifications && Object.keys(item.specifications).length > 0;
          return {
            ...item,
            brand: item.brand || prod.brand,
            priceText: item.priceText || prod.priceText,
            imageUrl: item.imageUrl || prod.thumbnailUrl || prod.images[0],
            specifications: hasSpecs
              ? item.specifications
              : Object.fromEntries(
                  prod.keySpecs.slice(0, 8).map((k) => [k.label, k.value]).filter(([k, v]) => k && v)
                ),
          };
        });
        const [readAlsoArticles, relatedProducts] = await Promise.all([
          article.readAlsoIds && article.readAlsoIds.length > 0
            ? getArticlesByIds(article.readAlsoIds).catch(() => [])
            : Promise.resolve([]),
          article.relatedProductIds && article.relatedProductIds.length > 0
            ? getProductsByIds(article.relatedProductIds).catch(() => [])
            : Promise.resolve([]),
        ]);
        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
            />
            <ListicleArticle
              article={article}
              category={{ slug: mainCat.slug, displayName: mainCat.displayName }}
              items={displayItems}
              readAlsoArticles={readAlsoArticles}
              relatedProducts={relatedProducts}
              linkedProducts={linkedMap}
            />
          </>
        );
      }

      const related = article.sectionId
        ? (await getArticlesBySection(article.sectionId, 7, 0).catch(() => ({ articles: [], total: 0 }))).articles.filter((a) => a.id !== article.id).slice(0, 6)
        : [];
      const relatedItems = related.map((a) => toCardItem(a, mainCat.slug));
      const contentLines = article.content ? article.content.split('\n') : [];

      // "Read also" — plain-title links to author-picked related articles.
      // "Related products" — product cards grouped by category.
      const [readAlsoArticles, relatedProducts] = await Promise.all([
        article.readAlsoIds && article.readAlsoIds.length > 0
          ? getArticlesByIds(article.readAlsoIds).catch(() => [])
          : Promise.resolve([]),
        article.relatedProductIds && article.relatedProductIds.length > 0
          ? getProductsByIds(article.relatedProductIds).catch(() => [])
          : Promise.resolve([]),
      ]);

      return (
        <article className="container-page py-6 sm:py-10">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
          />
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href={`/${mainCat.slug}`} className="transition-colors hover:text-foreground">
              {mainCat.displayName}
            </Link>
            {article.section && (
              <>
                <span>/</span>
                <Link href={`/${mainCat.slug}/${article.section.slug}`} className="transition-colors hover:text-foreground">
                  {article.section.title}
                </Link>
              </>
            )}
          </nav>

          <div className="mx-auto max-w-3xl">
            {article.section && (
              <Link
                href={`/${mainCat.slug}/${article.section.slug}`}
                className="badge-primary"
              >
                {article.section.title}
              </Link>
            )}
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:text-balance">
              {article.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
              <span className="text-sm text-muted-foreground">{formatDate(article.createdAt)}</span>
              <div className="ml-auto">
                <ArticleActions title={article.title} />
              </div>
            </div>
          </div>

          {article.thumbnailUrl && (
            <div className="relative mx-auto mt-8 aspect-[2/1] w-full max-w-3xl rounded-2xl border border-border bg-muted p-0.5">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                priority
                fetchPriority="high"
                className="max-h-full max-w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 72rem"
                placeholder="blur"
                blurDataURL={getImageBlurUrl(article.thumbnailUrl)}
                width={1200}
                height={600}
              />
            </div>
          )}

          <div className="mx-auto mt-8 max-w-3xl">
            <AdBanner placement="in-article" adSlot="in-content-1" />
          </div>

          {contentLines.length > 0 && (
            <div className="prose-article mx-auto mt-8 max-w-3xl text-lg leading-relaxed">
              {contentLines.map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="mt-8 font-serif text-2xl font-bold tracking-tight">{line.slice(3)}</h2>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>;
                }
                if (line.trim() === '') return null;
                return <p key={i} className="mt-4">{line}</p>;
              })}
            </div>
          )}

          <div className="mx-auto mt-8 max-w-3xl">
            <AdBanner placement="in-article" adSlot="article-bottom" />
          </div>

          {readAlsoArticles.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Read also: </span>
              {readAlsoArticles.map((ra, i) => (
                <span key={ra.id}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  <Link
                    href={`/${ra.mainCategory?.slug ?? mainCat.slug}/${ra.slug}`}
                    className="text-muted-foreground underline underline-offset-2 hover:text-primary"
                  >
                    {ra.title}
                  </Link>
                </span>
              ))}
            </div>
          )}

          <RelatedProducts products={relatedProducts} />

          {relatedItems.length > 0 && (
            <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-10">
              <h2 className="font-serif text-xl font-bold tracking-tight">Related stories</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {relatedItems.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          <div className="mx-auto mt-8 max-w-3xl">
            <Link href={`/${mainCat.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to {mainCat.displayName}
            </Link>
          </div>
        </article>
      );
    }
  }

  // ── Legacy post fallback (old posts/categories tables) ─────────────────
  const result = await getPostByCategoryAndSlug(params.category, params.slug).catch(() => null);

  if (!result || result.status === 'not-found') {
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
    ? await getPosts({ categorySlug: post.category.slug, pageSize: 6 }).catch(() => [])
    : [];

  const relatedPosts = related
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);

  const readAlsoPosts = post.readAlsoIds && post.readAlsoIds.length > 0
    ? await getPostsByIds(post.readAlsoIds).catch(() => [])
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
            <div className="relative mx-auto hidden aspect-[2/1] w-full max-w-3xl rounded-2xl border border-border bg-muted p-0.5 lg:block">
              <Image
                src={post.heroImage}
                alt={post.title}
                priority
                className="max-h-full max-w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 72rem"
                placeholder="blur"
                blurDataURL={getImageBlurUrl(post.heroImage)}
                width={1200}
                height={600}
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
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70 lg:text-sm">
                    {post.author && <span className="font-medium text-white/90">{post.author.name}</span>}
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile hero — 3:4 portrait */}
            <div className="relative mx-auto block aspect-[3/4] w-full max-w-sm rounded-2xl border border-border bg-muted p-0.5 lg:hidden">
              <Image
                src={post.heroImage}
                alt={post.title}
                priority
                className="max-h-full max-w-full object-contain"
                sizes="100vw"
                placeholder="blur"
                blurDataURL={getImageBlurUrl(post.heroImage)}
                width={400}
                height={533}
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
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
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
            {(post.tags?.length || post.category) && (
              <section className="mx-auto mt-10 max-w-3xl border-t border-border pt-8" aria-label="Read more">
                <p className="section-label mb-4">Read more</p>
                <div className="flex flex-wrap gap-2.5">
                  {post.category && (
                    <Link href={`/category/${post.category.slug}`} className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                      {post.category.name}
                    </Link>
                  )}
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
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
