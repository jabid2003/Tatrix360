import type { MetadataRoute } from 'next';
import { getPosts, getCategories } from '@/lib/data';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    getPosts({ pageSize: 1000 }),
    getCategories(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = posts
  .filter((p) => p.category && p.publishedAt)
  .map((p) => ({
    url: `${SITE_URL}/${p.category!.slug}/${p.slug}`,
    lastModified: new Date(p.publishedAt!),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
