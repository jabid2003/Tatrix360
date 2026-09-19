import { getSiteSettings } from '@/lib/site-settings';
import { SiteSettingsForm } from '@/components/site/admin/site-settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsAdminPage() {
  const settings = await getSiteSettings();

  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
        Site Settings
      </h1>
      <SiteSettingsForm initialSettings={settings} />
    </main>
  );
}