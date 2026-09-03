import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { NavbarManager } from '@/components/site/admin/navbar-manager';

export const metadata: Metadata = {
  title: 'Navbar',
};

export const revalidate = 60;

export default async function AdminNavbarPage() {
  const { data } = await supabase
    .from('navbar_links')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <main className="container-page max-w-4xl py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Navbar Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controls the fully dynamic site navigation. Changes appear instantly — no deployment required.
        </p>
      </div>

      <NavbarManager links={data ?? []} />
    </main>
  );
}
