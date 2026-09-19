import { getNavbarCategories } from '@/lib/sections';
import { NavbarClient, type FlatNavLink } from './navbar-client';

export default async function Navbar() {
  let links: FlatNavLink[] = [
    { id: 'home', label: 'Home', href: '/' },
  ];

  try {
    const cats = await getNavbarCategories().catch(() => []);
    if (cats.length > 0) {
      const dbLinks: FlatNavLink[] = cats.map((c) => ({
        id: c.slug,
        label: c.displayName,
        href: `/${c.slug}`,
      }));
      links = [...links, ...dbLinks];
    }
  } catch {
    // DB failed; Home remains.
  }

  return <NavbarClient links={links} />;
}
