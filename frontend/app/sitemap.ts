import type { MetadataRoute } from 'next';

import { getPosts, getCategories } from '@/lib/data';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL.replace(/\/+$/, '');

  const [posts, categories] = await Promise.all([
    getPosts({ pageSize: 1000 }),
    getCategories(),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/latest`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/subscribe`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap =
    categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => post.category && post.publishedAt)
    .map((post) => ({
      url: `${siteUrl}/${post.category!.slug}/${post.slug}`,
      lastModified: new Date(post.publishedAt!),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...postEntries,
  ];
}