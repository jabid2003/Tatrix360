import Image from 'next/image';
import { getHomepageFeatured } from '@/lib/sections';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { FadeInWhenVisible } from './fade-in-when-visible';
import { HeadingIcon } from './heading-icon';

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  mainCategory?: { slug: string; displayName: string } | null;
  section?: { title: string } | null;
}

export async function HomepageFeaturedSection() {
  const featured = await getHomepageFeatured().catch(() => []);
  if (featured.length === 0) return null;

  const visible = featured.filter((f) => f.isVisible);
  if (visible.length === 0) return null;

  const articleIds = visible.map((f) => f.articleId);
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, thumbnail_url, main_categories (slug, display_name), category_sections (title)')
    .in('id', articleIds);

  const articleMap = new Map<string, FeaturedArticle>();
  if (articles) {
    for (const a of articles as any[]) {
      articleMap.set(a.id, {
        id: a.id,
        title: a.title,
        slug: a.slug,
        thumbnailUrl: a.thumbnail_url,
        mainCategory: a.main_categories,
        section: a.category_sections,
      });
    }
  }

  // Group by custom heading name (categorySlug is the heading)
  const grouped: Record<string, { featured: typeof visible[0]; article?: FeaturedArticle }[]> = {};
  const headingIconMap: Record<string, string | null> = {};
  for (const item of visible) {
    const article = articleMap.get(item.articleId);
    if (!article) continue;
    (grouped[item.categorySlug] ??= []).push({ featured: item, article });
    if (item.headingIcon && !headingIconMap[item.categorySlug]) {
      headingIconMap[item.categorySlug] = item.headingIcon;
    }
  }

  const headings = Object.keys(grouped);
  if (headings.length === 0) return null;

  return (
    <section className="container-page py-8" aria-label="Homepage Featured">
      {headings.map((headingName) => {
        const items = grouped[headingName].slice(0, 6);
        return (
          <FadeInWhenVisible key={headingName} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <HeadingIcon name={headingIconMap[headingName] ?? 'LayoutGrid'} className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-bold tracking-tight">{headingName}</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
              {items.map((item, i) => (
                <FadeInWhenVisible key={item.featured.id} delay={i * 60}>
                  <a
                    href={`/${item.article!.mainCategory?.slug ?? 'article'}/${item.article!.slug}`}
                    className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-foreground/20 hover:bg-muted/40 snap-start min-w-[280px] lg:min-w-0 lg:w-auto"
                  >
                    {item.article!.thumbnailUrl && (
                      <div className="relative h-16 w-20 flex-shrink-0 bg-muted p-0.5">
                        <Image
                          src={item.article!.thumbnailUrl}
                          alt=""
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          width={80}
                          height={64}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                        {item.article!.title}
                      </h3>
                      {item.article!.section && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.article!.section.title}
                        </p>
                      )}
                    </div>
                  </a>
                </FadeInWhenVisible>
              ))}
            </div>
          </FadeInWhenVisible>
        );
      })}
    </section>
  );
}
