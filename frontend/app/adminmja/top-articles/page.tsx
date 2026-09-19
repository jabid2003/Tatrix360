import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminArticles } from '@/lib/sections';
import { TopLatestManager, type PinnedRow } from '@/components/site/admin/top-latest-manager';

export const dynamic = 'force-dynamic';

export default async function TopArticlesAdminPage() {
  const [pinnedRes, articles] = await Promise.all([
    supabaseAdmin
      .from('top_articles')
      .select(`
        sort_order,
        articles (
          id, title, slug, thumbnail_url, created_at,
          main_categories (slug, display_name),
          category_sections (title, slug)
        )
      `)
      .order('sort_order', { ascending: true }),
    getAdminArticles(),
  ]);

  const pinned = ((pinnedRes.data ?? []) as unknown as PinnedRow[]).filter((r) => r.articles);

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Top Articles & Latest
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mark any article for the homepage Top Articles box and/or the Latest feed.
          Lower order shows first. Articles that are neither Top nor Latest stay
          hidden from those sections.
        </p>
      </div>

      <TopLatestManager initialPinned={pinned} articles={articles} />
    </main>
  );
}