import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';

import Navbar from '@/components/site/navbar';
import { SiteFooter } from '@/components/site/site-footer';
import { RouteTransition } from '@/components/site/route-transition';
import { NavigationEvents } from '@/components/site/navigation-events';
import { Providers } from './providers';
import { AdBanner } from '@/components/site/ad-banner';

import {
  inter,
  playfair,
  jetbrainsMono,
} from './fonts';

export const revalidate = 300;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://tatrix360.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Tatrix360 — Tech, decoded.',
    template: '%s — Tatrix360',
  },

  description:
    'Sharp reporting on AI, gadgets, and the platforms shaping our digital lives.',

  applicationName: 'Tatrix360',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Tatrix360 — Tech, decoded.',
    description:
      'Sharp reporting on AI, gadgets, and the platforms shaping our digital lives.',
    url: '/',
    siteName: 'Tatrix360',
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Tatrix360 — Tech, decoded.',
    description:
      'Sharp reporting on AI, gadgets, and the platforms shaping our digital lives.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const isAdmin = headersList.get('x-is-admin') === '1';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <Providers>
          <NavigationEvents />

          {!isAdmin && (
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
            >
              Skip to content
            </a>
          )}

          {!isAdmin && <Navbar />}

          {/* AD SLOT 1: TOP BANNER — Leaderboard */}
          {!isAdmin && <AdBanner placement="leaderboard" adSlot="top-leaderboard" />}

          <main id="main-content" className="flex-1">
            <RouteTransition>{children}</RouteTransition>
          </main>

          {/* AD SLOT 4: BOTTOM BANNER */}
          {!isAdmin && <AdBanner placement="bottom-banner" adSlot="bottom-leaderboard" />}

          {!isAdmin && <SiteFooter />}
        </Providers>

        <SpeedInsights />
      </body>
    </html>
  );
}
