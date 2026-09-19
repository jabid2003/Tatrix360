import { getAuthorsAdmin } from '@/lib/authors';
import { AuthorsManager } from '@/components/site/admin/authors-manager';

export const dynamic = 'force-dynamic';

export default async function AuthorsAdminPage() {
  const authors = await getAuthorsAdmin();

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Authors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage authors: add, edit, activate/deactivate, or remove. Inactive authors are hidden from the site.
        </p>
      </div>
      <AuthorsManager initialAuthors={authors} />
    </main>
  );
}