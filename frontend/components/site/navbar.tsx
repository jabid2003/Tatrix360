import { getNavbarLinks } from '@/lib/navbar';
import { getCategories, getPostsByCategory } from '@/lib/data';
import { NavbarClient } from './navbar-client';
import type { Post } from '@/lib/types';

export default async function Navbar() {
  const [links, categories] = await Promise.all([
    getNavbarLinks().catch(() => []),
    getCategories().catch(() => []),
  ]);

  // One latest article per category, for the auto-sliding "Latest" ticker.
  const latestByCategory: Post[] = [];
  for (const cat of categories) {
    let posts: Post[] = [];
    try {
      const res = await getPostsByCategory(cat.slug, 1, 1);
      posts = Array.isArray(res) ? res : res.posts ?? [];
    } catch {
      posts = [];
    }
    if (posts[0]) latestByCategory.push(posts[0]);
  }

  return <NavbarClient links={links} latest={latestByCategory} />;
}
