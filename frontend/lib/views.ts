import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/types';

export async function getPostViews(slugs: string[]): Promise<Record<string, number>> {
  if (!slugs.length) return {};

  const { data, error } = await supabase
    .from('posts')
    .select('slug, views')
    .in('slug', slugs);

  if (error) {
    console.error('[supabase] getPostViews error:', error.message);
    return {};
  }

  return (data ?? []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.slug] = row.views ?? 0;
    return acc;
  }, {});
}

export async function applyViewCounts(posts: Post[]): Promise<Post[]> {
  if (!posts.length) return posts;

  const slugs = posts.map((p) => p.slug);
  const viewsMap = await getPostViews(slugs);

  return posts.map((post) => ({
    ...post,
    views: viewsMap[post.slug] ?? post.views ?? 0,
  }));
}