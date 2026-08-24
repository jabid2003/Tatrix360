import type { Metadata } from 'next';
import { cookies } from 'next/headers';
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
        <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold text-muted-foreground">
            Tatrix360 Admin
          </span>
          <LogoutButton />
        </header>
      )}

      {children}
    </div>
  );
}