import type { Metadata } from 'next';
import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';

import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { RouteTransition } from '@/components/site/route-transition';
import { NavigationEvents } from '@/components/site/navigation-events';
import { Providers } from './providers';
import { getMenu } from '@/lib/data';

import {
  inter,
  playfair,
  jetbrainsMono,
} from './fonts';

export const metadata: Metadata = {
  title: {
    default: 'Tatrix360 — Tech, decoded.',
    template: '%s — Tatrix360',
  },

  description:
    'Sharp reporting on AI, gadgets, and the platforms shaping our digital lives.',

  metadataBase: new URL('https://tatrix360.vercel.app'),

  openGraph: {
    title: 'Tatrix360',
    description: 'Tech, decoded.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = await getMenu();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <Providers>
          <NavigationEvents />

          <SiteHeader menu={menu} />

          <main className="flex-1">
            <RouteTransition>{children}</RouteTransition>
          </main>

          <SiteFooter />
        </Providers>

        <SpeedInsights />
      </body>
    </html>
  );
}