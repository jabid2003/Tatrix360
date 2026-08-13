import { getPosts } from '@/lib/data';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getPosts({ pageSize: 50 });

  const items = posts
    .map((post) => {
      if (
        !post.publishedAt ||
        !post.category?.slug ||
        !post.slug
      ) {
        return '';
      }

      const postUrl = `https://tatrix360.com/${post.category.slug}/${post.slug}`;

      const title = escapeXml(post.title);
      const description = escapeXml(post.subtitle ?? '');
      const publishedDate = new Date(
        post.publishedAt,
      ).toUTCString();

      return `
        <item>
          <title>${title}</title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <description>${description}</description>
          <pubDate>${publishedDate}</pubDate>
        </item>
      `;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tatrix360</title>
    <link>https://tatrix360.com</link>
    <description>
      Sharp reporting on AI, gadgets, and the platforms shaping our digital lives.
    </description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control':
        'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}