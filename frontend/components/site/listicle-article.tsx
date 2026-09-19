import Image from 'next/image';
import Link from 'next/link';
import { getImageBlurUrl } from '@/lib/image-utils';
import { formatDate } from '@/lib/utils';
import { ChevronRight, Check, X, Star } from 'lucide-react';
import type { Article } from '@/lib/sections';
import type { ArticleItem } from '@/lib/article-items';
import ArticleActions from '@/components/article-actions';

interface Props {
  article: Article;
  category: { slug: string; displayName: string };
  items: ArticleItem[];
  readAlsoArticles?: Article[];
}

export function ListicleArticle({ article, category, items, readAlsoArticles = [] }: Props) {
  const visibleItems = items.filter((i) => i.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  // Build comparison table columns from all specs keys
  const allSpecKeys = Array.from(new Set(visibleItems.flatMap((i) => Object.keys(i.specifications || {}))));
  const showComparison = allSpecKeys.length > 1 && visibleItems.length >= 2;
  const maxSpecsForTable = 8; // limit columns for readability
  const tableSpecs = allSpecKeys.slice(0, maxSpecsForTable);

  return (
    <article className="container-page py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/${category.slug}`} className="transition-colors hover:text-foreground">
          {category.displayName}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Best Picks</span>
      </nav>

      {/* Header */}
      <header className="mx-auto mb-8 max-w-4xl">
        {article.subtitle && (
          <p className="text-lg text-muted-foreground lg:text-xl">{article.subtitle}</p>
        )}
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:text-balance">
          {article.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
          <div className="flex items-center gap-3">
            {article.author && (
              <>
                {article.author.avatar && (
                  <Image src={article.author.avatar} alt={article.author.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{article.author.name}</p>
                  {article.author.role && <p className="text-xs text-muted-foreground">{article.author.role}</p>}
                </div>
              </>
            )}
            <span className="text-sm text-muted-foreground">{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          <div className="ml-auto">
            <ArticleActions title={article.title} />
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.thumbnailUrl && (
        <div className="relative mx-auto mt-8 aspect-[16/9] w-full max-w-4xl rounded-2xl border border-border bg-muted p-0.5">
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            priority
            className="max-h-full max-w-full object-contain"
            sizes="(max-width: 1024px) 100vw, 72rem"
            placeholder="blur"
            blurDataURL={getImageBlurUrl(article.thumbnailUrl)}
            width={1200}
            height={675}
          />
        </div>
      )}

      {/* Intro Content */}
      {article.introContent && (
        <div className="mx-auto mt-8 max-w-3xl prose-article text-lg leading-relaxed">
          {article.introContent.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="mt-8 font-serif text-2xl font-bold tracking-tight">{line.slice(3)}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>;
            if (line.trim() === '') return null;
            return <p key={i} className="mt-4">{line}</p>;
          })}
        </div>
      )}

      {/* Quick Comparison Table */}
      {showComparison && visibleItems.length > 0 && (
        <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="font-serif text-2xl font-bold tracking-tight">Quick Comparison</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-max text-sm" role="table">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="sticky left-0 p-3 text-left font-semibold">Product</th>
                  {tableSpecs.map((key) => (
                    <th key={key} className="p-3 text-left font-semibold">{key}</th>
                  ))}
                  <th className="p-3 text-left font-semibold">Price</th>
                  <th className="p-3 text-left font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="sticky left-0 p-3 font-medium bg-background">
                      <span className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold">{idx + 1}</span>
                        {item.imageUrl && (
                          <Image src={item.imageUrl} alt={item.title} width={40} height={40} className="h-10 w-10 rounded-lg object-contain p-0.5" />
                        )}
                        <span>{item.title}</span>
                      </span>
                    </td>
                    {tableSpecs.map((key) => (
                      <td key={key} className="p-3 text-muted-foreground">{item.specifications[key] ?? '—'}</td>
                    ))}
                    <td className="p-3 font-medium">{item.priceText ?? '—'}</td>
                    <td className="p-3">
                      {item.rating !== undefined && item.rating !== null ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4 fill-current" /> {item.rating.toFixed(1)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Table shows top {tableSpecs.length} specification categories. Full specs in product cards below.</p>
        </section>
      )}

      {/* Product List */}
      <section className="mx-auto mt-12 max-w-3xl" aria-labelledby="products-heading">
        <h2 id="products-heading" className="font-serif text-2xl font-bold tracking-tight">Top Picks</h2>

        {/* Table of Contents / Jump Links */}
        <nav className="mt-4 rounded-xl border border-border bg-muted/30 p-4" aria-label="Table of contents">
          <p className="font-semibold mb-2">Jump to product</p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleItems.map((item, idx) => (
              <li key={item.id}>
                <a href={`#product-${idx + 1}`} className="block rounded-lg px-2 py-1.5 text-xs hover:bg-background transition-colors">
                  <span className="font-bold mr-1">{idx + 1}.</span> {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Product Cards */}
        <div className="mt-8 space-y-12">
          {visibleItems.map((item, idx) => (
            <section key={item.id} id={`product-${idx + 1}`} className="rounded-2xl border border-border overflow-hidden" aria-labelledby={`product-title-${idx + 1}`}>
              <div className="relative aspect-[16/10] w-full bg-muted p-0.5">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt || item.title}
                    className="max-h-full max-w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getImageBlurUrl(item.imageUrl)}
                    width={800}
                    height={500}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/90 text-primary-foreground font-bold text-lg">{idx + 1}</span>
                </div>
                {item.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {item.badge}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <header>
                  <h3 id={`product-title-${idx + 1}`} className="font-serif text-2xl font-bold tracking-tight">
                    {item.title}
                  </h3>
                  {item.brand && <p className="mt-1 text-sm text-muted-foreground">{item.brand}</p>}
                  {item.releaseDate && <p className="mt-1 text-xs text-muted-foreground">Release: {new Date(item.releaseDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>}
                </header>

                {item.summary && <p className="text-lg text-muted-foreground">{item.summary}</p>}

                {item.description && (
                  <div className="prose-article text-base leading-relaxed">
                    {item.description.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <h4 key={i} className="mt-4 font-semibold">{line.slice(3)}</h4>;
                      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
                      if (line.trim() === '') return null;
                      return <p key={i} className="mt-3">{line}</p>;
                    })}
                  </div>
                )}

                {/* Key Specs Row */}
                {Object.keys(item.specifications || {}).length > 0 && (
                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-border pt-4">
                    {Object.entries(item.specifications).slice(0, 4).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  {item.priceText && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                      <span className="font-mono">{item.priceText}</span>
                    </span>
                  )}
                  {item.rating !== undefined && item.rating !== null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber/10 px-3 py-1.5 text-sm font-medium text-amber-700">
                      <Star className="h-4 w-4 fill-current" /> {item.rating.toFixed(1)}
                    </span>
                  )}
                  {item.productUrl && (
                    <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                      Buy Now <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {(item.pros?.length > 0) || (item.cons?.length > 0) ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-border">
                    {item.pros && item.pros.length > 0 && (
                      <div className="rounded-lg border border-green/30 bg-green/5 p-3">
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-green-700"><Check className="h-4 w-4" /> Pros</h4>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          {item.pros.map((p, i) => <li key={i} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {p}</li>)}
                        </ul>
                      </div>
                    )}
                    {item.cons && item.cons.length > 0 && (
                      <div className="rounded-lg border border-red/30 bg-red/5 p-3">
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-red-700"><X className="h-4 w-4" /> Cons</h4>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          {item.cons.map((c, i) => <li key={i} className="flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> {c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      {article.conclusionContent && (
        <section className="mx-auto mt-16 max-w-3xl border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-bold tracking-tight">Conclusion</h2>
          <div className="mt-6 prose-article text-lg leading-relaxed">
            {article.conclusionContent.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h3 key={i} className="mt-6 font-semibold text-xl">{line.slice(3)}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>;
              if (line.trim() === '') return null;
              return <p key={i} className="mt-4">{line}</p>;
            })}
          </div>
        </section>
      )}

      {/* Read also — plain-title links to author-picked related articles */}
      {readAlsoArticles.length > 0 && (
        <div className="mx-auto mt-8 max-w-3xl text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Read also: </span>
          {readAlsoArticles.map((ra, i) => (
            <span key={ra.id}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              <Link
                href={`/${ra.mainCategory?.slug ?? category.slug}/${ra.slug}`}
                className="text-muted-foreground underline underline-offset-2 hover:text-primary"
              >
                {ra.title}
              </Link>
            </span>
          ))}
        </div>
      )}
    </article>
  );
}