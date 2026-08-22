export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { supabase } from '@/lib/supabase';
import type { Post, Category, Author, Tag, MenuItem } from '@/lib/types';

// ---------------------------------------------------------------------------
// Row types from Supabase
// ---------------------------------------------------------------------------
interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}
interface AuthorRow {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  role: string | null;
}
interface TagRow {
  id: number;
  name: string;
  slug: string;
}
interface PostRow {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string | null;
  category_id: number | null;
  author_id: number | null;
  hero_image: string | null;
  post_type: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
  status: string;
  views: number;
  published_at: string | null;
  categories: CategoryRow | null;
  authors: AuthorRow | null;
  post_tags: { tags: TagRow }[];
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
function mapCategory(c: CategoryRow): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    sortOrder: c.sort_order,
  };
}
function mapAuthor(a: AuthorRow): Author {
  return { id: a.id, name: a.name, slug: a.slug, bio: a.bio ?? undefined, avatar: a.avatar ?? undefined, role: a.role ?? undefined };
}
function mapTag(t: TagRow): Tag {
  return { id: t.id, name: t.name, slug: t.slug };
}
function mapPost(p: PostRow): Post {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle ?? undefined,
    content: p.content ?? undefined,
    category: p.categories ? mapCategory(p.categories) : undefined,
    author: p.authors ? mapAuthor(p.authors) : undefined,
    tags: p.post_tags ? p.post_tags.map((pt) => mapTag(pt.tags)) : [],
    heroImage: p.hero_image ?? undefined,
    postType: p.post_type as Post['postType'] | undefined,
    seoTitle: p.seo_title ?? undefined,
    seoDescription: p.seo_description ?? undefined,
    featured: p.featured,
    publishedAt: p.published_at ?? undefined,
    status: p.status as Post['status'] | undefined,
    views: p.views,
  };
}

// ---------------------------------------------------------------------------
// Public API — mirrors the old lib/strapi.ts interface
// ---------------------------------------------------------------------------

export async function getPosts(opts: { featured?: boolean; pageSize?: number; categorySlug?: string } = {}): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) )
    `)
    .eq('status', 'Published')
    .order('published_at', { ascending: false });

  if (opts.featured) query = query.eq('featured', true);
  if (opts.categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', opts.categorySlug).maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const limit = opts.pageSize ?? 10;
  const { data, error } = await query.limit(limit);
  if (error) {
    console.error('[supabase] getPosts error:', error.message);
    return [];
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[supabase] getPostBySlug error:', error.message);
    return null;
  }
  if (!data) return null;
  return mapPost(data as unknown as PostRow);
}

// ---------------------------------------------------------------------------
// Category-validated single post lookup
// ---------------------------------------------------------------------------
//
// Fixes the routing bug where /any-category/some-slug would resolve to a
// post regardless of its real category, because the old page-level code
// only ever called getPostBySlug(slug) and ignored the category param.
//
// We deliberately do NOT try to filter at the Supabase query level with
// something like .eq('categories.slug', category) — when `categories` is
// pulled in via an embedded/joined select (`*, categories!fk (*)`), it is
// an embedded resource, not a flattened column, and PostgREST/supabase-js
// will not filter parent rows by it the way a SQL JOIN + WHERE would.
// getPosts() above works around this correctly for *listing* posts by
// doing a separate categories -> id lookup and filtering on category_id.
//
// For a single post, slugs are globally unique, so we just fetch by slug
// (reusing getPostBySlug) and validate the category in JS afterward. This
// also lets the caller distinguish "doesn't exist" (404) from "exists,
// wrong category" (redirect to the canonical URL) — a nicer UX/SEO outcome
// than collapsing both cases into a single 404.
// ---------------------------------------------------------------------------

export type PostLookupResult =
  | { status: 'ok'; post: Post }
  | { status: 'wrong-category'; post: Post; correctCategorySlug: string }
  | { status: 'not-found' };

export async function getPostByCategoryAndSlug(
  category: string,
  slug: string
): Promise<PostLookupResult> {
  const post = await getPostBySlug(slug);

  if (!post) {
    return { status: 'not-found' };
  }

  // A post with no assigned category can never resolve under any category
  // URL. This is what produced the /undefined/... bug previously — treat
  // it as not-found rather than letting an "undefined" category through.
  if (!post.category) {
    return { status: 'not-found' };
  }

  if (post.category.slug !== category) {
    return {
      status: 'wrong-category',
      post,
      correctCategorySlug: post.category.slug,
    };
  }

  return { status: 'ok', post };
}

export async function getTrendingPosts(limit = 5): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) )
    `)
    .eq('status', 'Published')
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[supabase] getTrendingPosts error:', error.message);
    return [];
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[supabase] getCategories error:', error.message);
    return [];
  }
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getAuthors(): Promise<Author[]> {
  const { data, error } = await supabase.from('authors').select('*');
  if (error) {
    console.error('[supabase] getAuthors error:', error.message);
    return [];
  }
  return (data as AuthorRow[]).map(mapAuthor);
}

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from('tags').select('*');
  if (error) {
    console.error('[supabase] getTags error:', error.message);
    return [];
  }
  return (data as TagRow[]).map(mapTag);
}

export async function getMenu(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[supabase] getMenu error:', error.message);
    return [];
  }
  return (data as (MenuItem & { sort_order: number })[]).map((m) => ({
    id: m.id,
    label: m.label,
    url: m.url,
    order: m.sort_order,
  }));
}

export async function searchPosts(query: string): Promise<Post[]> {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) )
    `)
    .eq('status', 'Published')
    .ilike('title', `%${q}%`)
    .limit(20);

  if (error) {
    console.error('[supabase] searchPosts error:', error.message);
    return [];
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

export async function subscribeEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.toLowerCase() });

  if (error) {
    if (error.code === '23505') return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function submitContact(name: string, email: string, message: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}