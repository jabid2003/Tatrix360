import type { Metadata } from 'next';
import { ContactForm } from '@/components/site/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Have a tip, correction, or partnership idea? Get in touch with the Tatrix360 team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact — Tatrix360',
    description: 'Have a tip, correction, or partnership idea? Get in touch with the Tatrix360 team.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return <ContactForm />;
}