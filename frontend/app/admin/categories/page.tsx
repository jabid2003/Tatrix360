import type { Metadata } from 'next';
import { getCategories, getSubcategories } from '@/lib/data';
import { CategoryManager } from '@/components/site/admin/category-manager';

export const metadata: Metadata = {
  title: 'Categories',
};

export default async function AdminCategoriesPage() {
  const [categories, subcategories] = await Promise.all([
    getCategories(),
    getSubcategories(true),
  ]);

  return (
    <main className="container-page max-w-4xl py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Category Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize main categories and their subcategories for the site navigation.
        </p>
      </div>

      <CategoryManager categories={categories} subcategories={subcategories} />
    </main>
  );
}