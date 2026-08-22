import type { Metadata } from 'next';
import { NewsletterBox } from '@/components/site/newsletter-box';
import { Zap, Shield, PenTool } from 'lucide-react';

export const metadata: Metadata = {
  // Plain string, not 'About | Tatrix360' — the root layout's
  // title.template ('%s — Tatrix360') applies to plain string titles
  // automatically, so spelling out the site name here risks it being
  // appended twice ("About | Tatrix360 — Tatrix360"). Let the template
  // do that job, same pattern as Contact/Search/Latest.
  title: 'About',
  description:
    'Learn about Tatrix360, an independent publication covering AI, mobile platforms, gadgets, and practical technology guides.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About — Tatrix360',
    description:
      'Learn about Tatrix360, an independent publication covering AI, mobile platforms, gadgets, and practical technology guides.',
    url: '/about',
  },
};

const values = [
  {
    icon: Zap,
    title: 'Fast & sharp',
    text: 'News and analysis that respects your time.',
  },
  {
    icon: Shield,
    title: 'Honest reviews',
    text: 'No sponsored reviews disguised as opinion.',
  },
  {
    icon: PenTool,
    title: 'Clear writing',
    text: 'Expert topics, explained for everyone.',
  },
];

export default function AboutPage() {
  return (
    <main className="container-page max-w-3xl py-10 sm:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          About Tatrix360
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Tatrix360 is tech, decoded.
        </h1>

        <p className="mt-4 text-lg leading-8 text-muted-foreground lg:text-pretty">
          We&apos;re an independent tech publication covering AI, mobile
          platforms, and the gadgets that shape our digital lives. We cut
          through the hype to tell you what actually matters.
        </p>
      </header>

      <section
        aria-labelledby="values-heading"
        className="mt-10"
      >
        <h2 id="values-heading" className="sr-only">
          Our values
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
            >
              <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              <h3 className="mt-3 font-semibold">{title}</h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="prose-article mt-12">
        <h2 className="font-serif text-2xl font-bold">What we cover</h2>

        <p className="text-lg leading-8 text-muted-foreground">
          AI models and their real-world impact. Mobile OS updates. Hardware
          reviews you can trust. And practical how-to guides that respect your
          time.
        </p>

        <h2 className="mt-8 font-serif text-2xl font-bold">Our promise</h2>

        <p className="text-lg leading-8 text-muted-foreground">
          No press releases dressed up as news. No sponsored reviews disguised
          as opinion. Just clear, honest reporting.
        </p>
      </section>

      <section
        aria-labelledby="newsletter-heading"
        className="mt-12 rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <h2 id="newsletter-heading" className="sr-only">
          Subscribe to the Tatrix360 newsletter
        </h2>

        <NewsletterBox />
      </section>
    </main>
  );
}