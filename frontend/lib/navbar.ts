import { supabase } from '@/lib/supabase';
import type { NavbarLink } from '@/types/navbar';

type NavRow = {
  id: string;
  label: string;
  slug: string;
  parent_id: string | null;
  is_mega_menu: boolean;
  icon_name: string | null;
  description: string | null;
  order_index: number;
};

export async function getNavbarLinks(): Promise<NavbarLink[]> {
  const [links, categories, subcategories] = await Promise.all([
    supabase.from('navbar_links').select('*').order('order_index', { ascending: true }),
    supabase.from('categories').select('id, name, slug').order('sort_order', { ascending: true }),
    supabase
      .from('subcategories')
      .select('*, categories (id, name, slug)')
      .order('sort_order', { ascending: true }),
  ]);

  const rows = (links.data ?? []) as NavRow[];
  const catBySlug = new Map((categories.data ?? []).map((c: any) => [c.slug, c]));
  const catByName = new Map(
    (categories.data ?? []).map((c: any) => [c.name.toLowerCase(), c])
  );
  // subLookup: keyed by both "<catSlug>/<subSlug>" AND "<catSlug>/<subNameLower>"
  const subLookup = new Map<string, { slug: string; categorySlug: string }>();
  (subcategories.data ?? []).forEach((s: any) => {
    const cat = s.categories as { slug?: string } | null;
    if (cat?.slug) {
      subLookup.set(`${cat.slug}/${s.slug}`, { slug: s.slug, categorySlug: cat.slug });
      subLookup.set(`${cat.slug}/${String(s.name ?? '').toLowerCase()}`, {
        slug: s.slug,
        categorySlug: cat.slug,
      });
    }
  });

  // Resolve a stored nav href to a real, routable href.
  const resolve = (href: string): string => {
    if (href === '/' || href.startsWith('/about') || href.startsWith('/contact') || href.startsWith('/latest')) {
      return href;
    }
    const seg = href.split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean);

    if (seg[0] === 'category') {
      // /category/<cat>
      if (seg.length === 2) {
        const cat = catBySlug.get(seg[1]) ?? catByName.get(seg[1].replace(/-/g, ' '));
        if (cat) return `/category/${cat.slug}`;
      }
      // /category/<cat>/<sub>
      if (seg.length === 3) {
        const cat = catBySlug.get(seg[1]) ?? catByName.get(seg[1].replace(/-/g, ' '));
        // try raw path, then real-cat path, then sub-by-name
        const found =
          subLookup.get(`${seg[1]}/${seg[2]}`) ??
          (cat ? subLookup.get(`${cat.slug}/${seg[2]}`) : undefined) ??
          (cat ? subLookup.get(`${cat.slug}/${seg[2].replace(/-/g, ' ')}`) : undefined);
        if (found) return `/category/${found.categorySlug}/${found.slug}`;
        if (cat) return `/category/${cat.slug}/${seg[2]}`;
      }
      return href;
    } else if (seg.length === 1) {
      const cat = catBySlug.get(seg[0]);
      if (cat) return `/category/${cat.slug}`;
      return href;
    }
    return href;
  };

  const map = new Map<string, NavbarLink>();
  rows.forEach((l) =>
    map.set(l.id, {
      id: l.id,
      label: l.label,
      slug: resolve(l.slug),
      parent_id: l.parent_id,
      is_mega_menu: l.is_mega_menu,
      icon_name: l.icon_name ?? undefined,
      description: l.description ?? undefined,
      order_index: l.order_index,
      children: [],
    })
  );

  const roots: NavbarLink[] = [];
  rows.forEach((l) => {
    const node = map.get(l.id)!;
    if (l.parent_id && map.has(l.parent_id)) {
      map.get(l.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  roots.forEach((r) => r.children?.sort((a, b) => a.order_index - b.order_index));
  return roots;
}
