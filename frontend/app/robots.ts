import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/supabase';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL.replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },

    sitemap: `${siteUrl}/sitemap.xml`,

    host: siteUrl,
  };
}