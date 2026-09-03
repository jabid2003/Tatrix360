import type { Metadata } from 'next';
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

export const revalidate = 60;

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <Providers>
          <NavigationEvents />

          <Navbar />
          <AdBanner placement="header" adSlot="header-leaderboard" />

          <main className="flex-1">
            <RouteTransition>{children}</RouteTransition>
          </main>

          <AdBanner placement="footer" adSlot="footer-leaderboard" />
          <SiteFooter />
        </Providers>

        <SpeedInsights />
      </body>
    </html>
  );
}