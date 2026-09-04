export const revalidate = 3600;

import type { Metadata } from 'next';
import { NewsletterForm } from '@/components/site/newsletter-form';

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
  return <NewsletterForm />;
}
