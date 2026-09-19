import Link from 'next/link';
import { Twitter, Github, Zap, Mail, Youtube, Instagram } from 'lucide-react';
import { getNavbarCategories } from '@/lib/sections';
import { getSiteSettings } from '@/lib/site-settings';

export async function SiteFooter() {
  const [cats, settings] = await Promise.all([
    getNavbarCategories().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const siteName = settings?.siteName ?? 'Tatrix360';
  const description = settings?.description ?? 'Sharp, independent tech reporting on AI, systems, devices, and the apps that shape our digital lives.';
  const copyrightText = settings?.copyrightText ?? `© ${new Date().getFullYear()} ${siteName}. Tech, decoded.`;
  const showNewsletter = settings?.showNewsletter ?? true;

  return (
    <footer className="mt-20 border-t border-border bg-muted/30" role="contentinfo">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteName} Home`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </span>
              <span className="text-base font-bold text-foreground">
                <span>{siteName.replace('360', '')}</span>
                <span className="text-primary">360</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{description}</p>
            <div className="mt-4 flex items-center gap-2">
              {settings?.socialTwitter && (
                <Link href={settings.socialTwitter} aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-3.5 w-3.5" />
                </Link>
              )}
              {settings?.socialGithub && (
                <Link href={settings.socialGithub} aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" />
                </Link>
              )}
              {settings?.socialYoutube && (
                <Link href={settings.socialYoutube} aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-3.5 w-3.5" />
                </Link>
              )}
              {settings?.socialInstagram && (
                <Link href={settings.socialInstagram} aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Sections</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {cats.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="transition-colors hover:text-foreground">{c.displayName}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Company</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
              <li><Link href="/latest" className="transition-colors hover:text-foreground">Latest</Link></li>
            </ul>
          </div>

          {showNewsletter && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Subscribe</h2>
              <p className="mt-3 text-sm text-muted-foreground">Weekly tech briefing, no spam.</p>
              <Link
                href="/subscribe"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
                Join free
              </Link>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">{copyrightText}</p>
          <p className="text-xs text-muted-foreground">Built with care for readers who care about tech.</p>
        </div>
      </div>
    </footer>
  );
}
