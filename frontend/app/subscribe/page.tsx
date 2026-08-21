import type { Metadata } from 'next';
import { NewsletterBox } from '@/components/site/newsletter-box';

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    'Join thousands of readers getting the sharpest tech reporting from Tatrix360 in their inbox every week.',
  alternates: {
    canonical: '/subscribe',
  },
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
      <p className="mt-2 text-lg text-muted-foreground">Join thousands of readers getting the sharpest tech reporting in their inbox every week.</p>
      <div className="mt-8">
        <NewsletterBox />
      </div>
    </div>
  );
}