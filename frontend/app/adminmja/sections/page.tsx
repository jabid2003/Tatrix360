import { getMainCategories, getSectionsByCategory } from '@/lib/sections';
import { SectionManager } from '@/components/site/admin/section-manager';

export const dynamic = 'force-dynamic';

export default async function SectionsAdminPage() {
  const mainCategories = await getMainCategories();

  const grouped = await Promise.all(
    mainCategories.map(async (category) => ({
      category,
      sections: await getSectionsByCategory(category.id, true),
    }))
  );

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Sections
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create sections per main category, sort them, or hide them from hub pages.
        </p>
      </div>

      {mainCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">
            No main categories found. Run supabase/RESET_NEW_ARCHITECTURE.sql first.
          </p>
        </div>
      ) : (
        <SectionManager mainCategories={mainCategories} initialGrouped={grouped} />
      )}
    </main>
  );
}
