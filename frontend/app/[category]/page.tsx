import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getMainCategoryBySlug,
  getSectionsByCategory,
  getArticlesBySection,
  HUB_LINKS,
} from '@/lib/sections';
import { SectionGrid } from '@/components/site/section-grid';
import type { ArticleCardItem } from '@/components/site/article-card';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Static hub slugs — DB-backed extras resolve on demand via dynamicParams.
  return HUB_LINKS.map((h) => ({ category: h.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const category = await getMainCategoryBySlug(params.category);
  if (!category) return { title: 'Not Found' };
  return {
    title: category.displayName,
    description: `Latest ${category.displayName} stories, guides and explainers on Tatrix360.`,
    openGraph: {
      title: `${category.displayName} — Tatrix360`,
      description: `Latest ${category.displayName} stories, guides and explainers on Tatrix360.`,
      type: 'website',
    },
  };
}

export default async function HubPage({ params }: { params: { category: string } }) {
  const category = await getMainCategoryBySlug(params.category);

  if (!category) {
    notFound();
  }

  const sections = await getSectionsByCategory(category.id, false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.displayName,
    url: `${siteUrl}/${category.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Tatrix360', url: siteUrl },
  };

  // First 6 articles per visible section (offset pagination continues
  // client-side via the "View More" button / /api/articles).
  const sectionsWithArticles = await Promise.all(
    sections.map(async (section) => {
      const { articles, total } = await getArticlesBySection(section.id, 6, 0);
      const items: ArticleCardItem[] = articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        thumbnailUrl: a.thumbnailUrl,
        createdAt: a.createdAt,
        categorySlug: category.slug,
      }));
      return { section, items, total };
    })
  );

  const populated = sectionsWithArticles.filter((s) => s.items.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="container-page py-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">{category.displayName}</span>
        </nav>

        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            {category.displayName}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Latest stories in {category.displayName}
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
            <p className="text-muted-foreground">
              No sections yet. Add sections from the admin panel to start publishing here.
            </p>
          </div>
        ) : populated.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
            <p className="text-muted-foreground">No articles in {category.displayName} yet.</p>
          </div>
        ) : (
          populated.map(({ section, items, total }) => (
            <SectionGrid
              key={section.id}
              categorySlug={category.slug}
              categoryName={category.displayName}
              sectionId={section.id}
              sectionTitle={section.title}
              sectionSlug={section.slug}
              initialArticles={items}
              total={total}
              pageSize={6}
              showViewAll
            />
          ))
        )}
      </main>
    </>
  );
}
