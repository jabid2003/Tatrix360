import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminArticles, getHomepageFeatured } from '@/lib/sections';
import { HomepageFeaturedManager } from '@/components/site/admin/homepage-featured-manager';

export const dynamic = 'force-dynamic';

export default async function HomepageFeaturedAdminPage() {
  const [featured, articles] = await Promise.all([
    getHomepageFeatured(),
    getAdminArticles({ status: 'Published' }),
  ]);

  // Fetch article details for each featured item
  const articleIds = featured.map((f) => f.articleId);
  let articleDetails: Record<string, any> = {};
  if (articleIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug, thumbnail_url, created_at, main_categories (slug, display_name), category_sections (title)')
      .in('id', articleIds);
    if (data) {
      articleDetails = Object.fromEntries(data.map((a: any) => [a.id, a]));
    }
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Homepage Featured
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curate which articles appear on the homepage, grouped by category.
          Each category section gets its own block with a &quot;View All&quot; button.
        </p>
      </div>

      <HomepageFeaturedManager
        initialFeatured={featured}
        articleDetails={articleDetails}
        allArticles={articles}
      />
    </main>
  );
}
