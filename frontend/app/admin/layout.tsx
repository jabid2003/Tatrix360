import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import { LogoutButton } from '@/components/site/admin/logout-button';

// The whole /admin section is private tooling, not site content — never
// index it, and don't let it appear in link previews either.
export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only show the "logged in as admin" top bar (with logout) when there's
  // an actual valid session. This layout also wraps /admin/login, where
  // there's nothing to log out of yet.
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const isLoggedIn = token ? await verifySessionToken(token) : false;

  return (
    <div className="min-h-screen bg-background">
      {isLoggedIn && (
        <header className="border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-sm font-semibold text-muted-foreground">
              Tatrix360 Admin
            </span>
            <LogoutButton />
          </div>
          <nav className="flex gap-1 px-4 pb-3 sm:px-6" aria-label="Admin navigation">
            {[
              { href: '/admin', label: 'Articles' },
              { href: '/admin/posts/new', label: 'New Article' },
              { href: '/admin/categories', label: 'Categories' },
              { href: '/admin/navbar', label: 'Navbar' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
      )}

      {children}
    </div>
  );
}