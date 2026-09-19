import { getNavbarCategories, createMainCategory, updateMainCategory, deleteMainCategory, reorderMainCategories, getMainCategories } from '@/lib/sections';
import { MainCategoryManager } from '@/components/site/admin/main-category-manager';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdminPage() {
  const cats = await getNavbarCategories();
  const all = await getMainCategories();
  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Navigation Categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the main navigation categories. Reorder, hide, or edit. Home is a static link always shown first.
        </p>
      </div>
      <MainCategoryManager initialCategories={all} />
    </main>
  );
}