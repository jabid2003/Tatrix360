export const revalidate = 3600;

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    'Join thousands of readers getting the sharpest tech reporting from Tatrix360 in their inbox every week.',
  alternates: { canonical: '/subscribe' },
  openGraph: {
    title: 'Subscribe — Tatrix360',
    description:
      'Join thousands of readers getting the sharpest tech reporting from Tatrix360 in their inbox every week.',
    url: '/subscribe',
  },
};

export default function SubscribePage() {
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-4xl font-bold">Subscribe</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Join thousands of readers getting the sharpest tech reporting in their inbox every week.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Subscribe via the newsletter form in the footer on any page — no spam, unsubscribe anytime.
        </p>
        <Link href="/#footer-newsletter" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Go to footer
        </Link>
      </div>
    </div>
  );
}

