import Link from 'next/link';
import type { Metadata } from 'next';
import { Smartphone, Laptop, Tablet, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Specs',
  description: 'Dedicated specification hubs for Mobiles, Laptops and Gadgets on Tatrix360. Browse full specs or see our curated Top picks.',
  alternates: { canonical: '/specs' },
  openGraph: {
    title: 'Specs — Tatrix360',
    description: 'Dedicated specification hubs for Mobiles, Laptops and Gadgets. Browse full specs or see our curated Top picks.',
    url: '/specs',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Specs — Tatrix360',
    description: 'Dedicated specification hubs for Mobiles, Laptops and Gadgets.',
  },
};

const CATS = [
  { slug: 'mobiles', label: 'Mobiles', desc: 'Phones, comparisons and buying guides.', icon: Smartphone, href: '/specs/mobiles', top: '/top/mobiles' },
  { slug: 'laptops', label: 'Laptops', desc: 'Laptops, reviews and buying guides.', icon: Laptop, href: '/specs/laptops', top: '/top/laptops' },
  { slug: 'gadgets', label: 'Gadgets', desc: 'Hardware reviews and hands-on.', icon: Tablet, href: '/specs/gadgets', top: '/top/gadgets' },
];

export default function SpecsOverviewPage() {
  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <p className="section-label text-primary">Specs</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Explore Specs</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Dedicated specification hubs for Mobiles, Laptops and Gadgets. Browse full specs or see our curated Top picks.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATS.map((c) => (
          <div key={c.slug} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
            <h2 className="mt-3 font-semibold text-lg">{c.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground flex-1">{c.desc}</p>
            <div className="mt-4 flex gap-2">
              <Link href={c.href} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">View Specs <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link href={c.top} className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Top {c.label}</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
