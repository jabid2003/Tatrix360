import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Post, Category, Author, Tag, MenuItem, Subcategory } from '@/lib/types';

// ---------------------------------------------------------------------------
// Build-time retry wrapper
// ---------------------------------------------------------------------------
// During `next build`, `generateStaticParams` fires many queries against
// Supabase in quick succession.  A single transient timeout kills the
// entire build.  `retry` wraps any async function and retries it up to
// `maxAttempts` times with exponential back-off.
// ---------------------------------------------------------------------------

const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

async function retry<T>(
  fn: () => Promise<T>,
  { maxAttempts = isBuild ? 3 : 1, label = '' } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = 1_000 * Math.pow(2, attempt - 1); // 1 s, 2 s, 4 s …
        console.warn(
          `[retry] ${label} attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms…`,
          err instanceof Error ? err.message : err
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

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
interface SubcategoryRow {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
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
  read_also_ids: number[] | null;
  categories: CategoryRow | null;
  authors: AuthorRow | null;
  post_tags: { tags: TagRow }[];
  post_categories: { categories: CategoryRow }[];
  subcategories: SubcategoryRow | null;
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
function mapSubcategory(s: SubcategoryRow): Subcategory {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    categoryId: s.category_id ?? undefined,
    description: s.description ?? undefined,
    sortOrder: s.sort_order,
    isActive: s.is_active,
  };
}
function mapPost(p: PostRow): Post {
  // Collect all categories: from post_categories join (multi) + fallback to single category_id
  const allCategories: Category[] = [];

  // From post_categories join table
  if (p.post_categories && p.post_categories.length > 0) {
    p.post_categories.forEach((pc) => {
      if (pc.categories) allCategories.push(mapCategory(pc.categories));
    });
  }

  // Fallback: if no post_categories, use the single category_id
  if (allCategories.length === 0 && p.categories) {
    allCategories.push(mapCategory(p.categories));
  }

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle ?? undefined,
    content: p.content ?? undefined,
    category: p.categories ? mapCategory(p.categories) : undefined,
    categories: allCategories.length > 0 ? allCategories : undefined,
    author: p.authors ? mapAuthor(p.authors) : undefined,
    tags: p.post_tags ? p.post_tags.map((pt) => mapTag(pt.tags)) : [],
    subcategory: p.subcategories ? mapSubcategory(p.subcategories) : undefined,
    heroImage: p.hero_image ?? undefined,
    postType: p.post_type as Post['postType'] | undefined,
    seoTitle: p.seo_title ?? undefined,
    seoDescription: p.seo_description ?? undefined,
    featured: p.featured,
    publishedAt: p.published_at ?? undefined,
    status: p.status as Post['status'] | undefined,
    views: p.views,
    readAlsoIds: p.read_also_ids ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API — mirrors the old lib/strapi.ts interface
// ---------------------------------------------------------------------------

export async function getPosts(opts: { featured?: boolean; pageSize?: number; categorySlug?: string } = {}): Promise<Post[]> {
  return retry(async () => {
    let query = supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
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
  }, { label: 'getPosts' });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return retry(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[supabase] getPostBySlug error:', error.message);
      return null;
    }
    if (!data) return null;
    return mapPost(data as unknown as PostRow);
  }, { label: 'getPostBySlug' });
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

// ---------------------------------------------------------------------------
// Admin: create / update / delete posts
// ---------------------------------------------------------------------------
//
// Author and tags are "find or create by name" — the admin form lets the
// user pick an existing one or type a brand-new name, and we resolve that
// into a real row (reusing an existing match by case-insensitive name, or
// inserting a new one) rather than requiring the name to already exist.
// Category is NOT find-or-create — the form only offers a dropdown of
// existing categories, so callers always pass a real category_id.
//
// All writes here (posts, authors, tags, post_tags) use `supabaseAdmin`
// (service-role key, bypasses RLS). These functions are only ever called
// from the password-protected admin routes — that middleware check is the
// real security boundary, not RLS. Public reads elsewhere in this file
// keep using the anon `supabase` client.
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeIlike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&');
}

async function findOrCreateAuthorId(name: string): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { data: existing } = await supabaseAdmin
      .from('authors')
      .select('id')
      .ilike('name', escapeIlike(trimmed))
      .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabaseAdmin
    .from('authors')
    .insert({ name: trimmed, slug: slugify(trimmed) })
    .select('id')
    .single();

  if (error) {
    console.error('[supabase] findOrCreateAuthorId insert error:', error.message);
    return null;
  }
  return created.id;
}

async function findOrCreateTagIds(names: string[]): Promise<number[]> {
  const ids: number[] = [];

  for (const raw of names) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const { data: existing } = await supabaseAdmin
      .from('tags')
      .select('id')
      .ilike('name', escapeIlike(trimmed))
      .maybeSingle();

    if (existing) {
      ids.push(existing.id);
      continue;
    }

    const { data: created, error } = await supabaseAdmin
      .from('tags')
      .insert({ name: trimmed, slug: slugify(trimmed) })
      .select('id')
      .single();

    if (error) {
      console.error('[supabase] findOrCreateTagIds insert error:', error.message);
      continue;
    }
    ids.push(created.id);
  }

  return ids;
}

async function syncPostTags(postId: number, tagIds: number[]): Promise<void> {
  // Keep post_tags in sync with the form's multi-select: remove this post's
  // existing relations, then re-insert the new set. De-dupe via Set so the
  // same tag picked twice can't violate the (post_id, tag_id) primary key.
  await supabaseAdmin.from('post_tags').delete().eq('post_id', postId);
  const uniqueTagIds = [...new Set(tagIds)];
  if (uniqueTagIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('post_tags')
      .insert(uniqueTagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
    if (error) console.error('[supabase] syncPostTags error:', error.message);
  }
}

async function syncPostCategories(postId: number, categoryIds: number[]): Promise<void> {
  await supabaseAdmin.from('post_categories').delete().eq('post_id', postId);
  const uniqueCategoryIds = [...new Set(categoryIds)];
  if (uniqueCategoryIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('post_categories')
      .insert(uniqueCategoryIds.map((categoryId) => ({ post_id: postId, category_id: categoryId })));
    if (error) console.error('[supabase] syncPostCategories error:', error.message);
  }
}

async function findOrCreateCategoryId(name: string): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .ilike('name', escapeIlike(trimmed))
      .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: trimmed, slug: slugify(trimmed) })
    .select('id')
    .single();

  if (error) {
    console.error('[supabase] findOrCreateCategoryId insert error:', error.message);
    return null;
  }
  return created.id;
}

async function findOrCreateCategoryIds(names: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const name of names) {
    const id = await findOrCreateCategoryId(name);
    if (id) ids.push(id);
  }
  return ids;
}

export async function createCategory(name: string): Promise<{ ok: boolean; category?: Category; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Category name is required.' };

  // Check if exists
  const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('*')
      .ilike('name', escapeIlike(trimmed))
      .maybeSingle();

  if (existing) {
    return { ok: true, category: mapCategory(existing as CategoryRow) };
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: trimmed, slug: slugify(trimmed) })
    .select('*')
    .single();

  if (error) {
    console.error('[supabase] createCategory error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, category: mapCategory(data as CategoryRow) };
}

export interface PostInput {
  title: string;
  slug: string;
  subtitle?: string;
  content?: string;
  categoryId?: number;
  categoryIds?: number[];
  subcategoryId?: number;
  authorName: string;
  tagNames: string[];
  heroImage?: string;
  postType?: Post['postType'];
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  status: NonNullable<Post['status']>;
  /** ISO string. If omitted and status is 'Published', defaults to now. */
  publishedAt?: string | null;
  readAlsoIds?: number[];
}

export async function createPost(
  input: PostInput
): Promise<{ ok: boolean; post?: Post; error?: string }> {
  const authorId = await findOrCreateAuthorId(input.authorName);
  const tagIds = await findOrCreateTagIds(input.tagNames);

  // Determine category IDs: use categoryIds if provided, fallback to single categoryId
  const categoryIds = input.categoryIds && input.categoryIds.length > 0
    ? input.categoryIds
    : input.categoryId
      ? [input.categoryId]
      : [];

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle || null,
      content: input.content || null,
      category_id: categoryIds[0] ?? null,
      subcategory_id: input.subcategoryId ?? null,
      author_id: authorId,
      hero_image: input.heroImage || null,
      post_type: input.postType || null,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      featured: input.featured ?? false,
      status: input.status,
      published_at:
        input.publishedAt ?? (input.status === 'Published' ? new Date().toISOString() : null),
      views: 0,
      read_also_ids: input.readAlsoIds && input.readAlsoIds.length > 0 ? input.readAlsoIds : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[supabase] createPost error:', error?.message);
    return { ok: false, error: error?.message || 'Failed to create post.' };
  }

  await syncPostTags(data.id, tagIds);
  await syncPostCategories(data.id, categoryIds);

  const post = await getPostBySlug(input.slug);
  return { ok: true, post: post ?? undefined };
}

export async function updatePost(
  id: number,
  input: PostInput
): Promise<{ ok: boolean; post?: Post; error?: string }> {
  const authorId = await findOrCreateAuthorId(input.authorName);
  const tagIds = await findOrCreateTagIds(input.tagNames);

  // Determine category IDs: use categoryIds if provided, fallback to single categoryId
  const categoryIds = input.categoryIds && input.categoryIds.length > 0
    ? input.categoryIds
    : input.categoryId
      ? [input.categoryId]
      : [];

  const { error } = await supabaseAdmin
    .from('posts')
    .update({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle || null,
      content: input.content || null,
      category_id: categoryIds[0] ?? null,
      subcategory_id: input.subcategoryId ?? null,
      author_id: authorId,
      hero_image: input.heroImage || null,
      post_type: input.postType || null,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      featured: input.featured ?? false,
      status: input.status,
      published_at:
        input.publishedAt ?? (input.status === 'Published' ? new Date().toISOString() : null),
      read_also_ids: input.readAlsoIds && input.readAlsoIds.length > 0 ? input.readAlsoIds : null,
    })
    .eq('id', id);

  if (error) {
    console.error('[supabase] updatePost error:', error.message);
    return { ok: false, error: error.message };
  }

  await syncPostTags(id, tagIds);
  await syncPostCategories(id, categoryIds);

  const post = await getPostBySlug(input.slug);
  return { ok: true, post: post ?? undefined };
}

export async function deletePost(id: number): Promise<{ ok: boolean; error?: string }> {
  // Delete the join rows first regardless of whether the DB has ON DELETE
  // CASCADE configured for post_tags.post_id — explicit here is cheap and
  // avoids relying on schema details we haven't verified.
  await supabaseAdmin.from('post_tags').delete().eq('post_id', id);
  await supabaseAdmin.from('post_categories').delete().eq('post_id', id);

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);

  if (error) {
    console.error('[supabase] deletePost error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getPostById(id: number): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) ),
      post_categories ( categories (*) ),
        subcategories ( * )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[supabase] getPostById error:', error.message);
    return null;
  }
  if (!data) return null;
  return mapPost(data as unknown as PostRow);
}

// Admin listing — unlike getPosts(), this does NOT filter by
// status: 'Published'. Drafts and archived posts need to show up in the
// dashboard too.
export async function getAdminPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) ),
      post_categories ( categories (*) ),
        subcategories ( * )
    `)
    .order('id', { ascending: false })
    .limit(200);

  if (error) {
    console.error('[supabase] getAdminPosts error:', error.message);
    return [];
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getTrendingPosts(limit = 5): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
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
  return retry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[supabase] getCategories error:', error.message);
      return [];
    }
    return (data as CategoryRow[]).map(mapCategory);
  }, { label: 'getCategories' });
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
  return retry(async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[supabase] getMenu error:', error.message);
      return [];
    }

    const PRIMARY_URLS = ['/', '/category/ai', '/category/news', '/category/gadgets', '/category/do-you-know', '/about'];

    return (data as (MenuItem & { sort_order: number; section?: string })[]).map((m) => ({
      id: m.id,
      label: m.label,
      url: m.url,
      order: m.sort_order,
      section: (m.section as 'primary' | 'secondary') ?? (PRIMARY_URLS.includes(m.url) ? 'primary' : 'secondary'),
    }));
  }, { label: 'getMenu' });
}

export async function getMenuBySection(section: 'primary' | 'secondary'): Promise<MenuItem[]> {
  const all = await getMenu();
  return all.filter((m) => m.section === section);
}

// ---------------------------------------------------------------------------
// Subcategories
// ---------------------------------------------------------------------------

interface SubcategoryWithCategoryRow extends SubcategoryRow {
  categories?: CategoryRow | null;
}

export async function getSubcategories(includeInactive = false): Promise<Subcategory[]> {
  return retry(async () => {
    let query = supabase
      .from('subcategories')
      .select(`
        *,
        categories (id, name, slug)
      `)
      .order('sort_order', { ascending: true });

    if (!includeInactive) query = query.eq('is_active', true);

    const { data, error } = await query;

    if (error) {
      console.error('[supabase] getSubcategories error:', error.message);
      return [];
    }

    return (data as unknown as SubcategoryWithCategoryRow[]).map((s) => ({
      ...mapSubcategory(s),
      category: s.categories ? { id: s.categories.id, name: s.categories.name, slug: s.categories.slug } : undefined,
    }));
  }, { label: 'getSubcategories' });
}

export async function getSubcategoryBySlug(slug: string): Promise<Subcategory | null> {
  return retry(async () => {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        categories (id, name, slug)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    const s = data as unknown as SubcategoryWithCategoryRow;
    return {
      ...mapSubcategory(s),
      category: s.categories ? { id: s.categories.id, name: s.categories.name, slug: s.categories.slug } : undefined,
    };
  }, { label: 'getSubcategoryBySlug' });
}

export async function getSubcategoriesByCategory(categorySlug: string): Promise<Subcategory[]> {
  return retry(async () => {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (!cat) return [];

    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        categories (id, name, slug)
      `)
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[supabase] getSubcategoriesByCategory error:', error.message);
      return [];
    }

    return (data as unknown as SubcategoryWithCategoryRow[]).map((s) => ({
      ...mapSubcategory(s),
      category: s.categories ? { id: s.categories.id, name: s.categories.name, slug: s.categories.slug } : undefined,
    }));
  }, { label: 'getSubcategoriesByCategory' });
}

export interface SubcategoryInput {
  name: string;
  slug: string;
  categoryId: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function createSubcategory(input: SubcategoryInput): Promise<{ ok: boolean; subcategory?: Subcategory; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('subcategories')
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
      category_id: input.categoryId,
      description: input.description?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('[supabase] createSubcategory error:', error?.message);
    return { ok: false, error: error?.message || 'Failed to create subcategory.' };
  }
  return { ok: true, subcategory: mapSubcategory(data as SubcategoryRow) };
}

export async function updateSubcategory(
  id: number,
  input: Partial<SubcategoryInput>
): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.slug !== undefined) patch.slug = input.slug.trim();
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  patch.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from('subcategories').update(patch).eq('id', id);
  if (error) {
    console.error('[supabase] updateSubcategory error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteSubcategory(id: number): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from('subcategories').delete().eq('id', id);
  if (error) {
    console.error('[supabase] deleteSubcategory error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getPostsBySubcategory(
  subcategorySlug: string,
  limit = 5,
  offset = 0
): Promise<{ posts: Post[]; total: number }> {
  return retry(async () => {
    const { data: sub } = await supabase
      .from('subcategories')
      .select('id')
      .eq('slug', subcategorySlug)
      .maybeSingle();

    if (!sub) return { posts: [], total: 0 };

    const [{ data, error, count }, { error: countError, count: totalCount }] = await Promise.all([
      supabase
        .from('posts')
        .select(`
          *,
          categories!posts_category_id_fkey (*),
          authors!posts_author_id_fkey (*),
          post_tags ( tags (*) ),
          post_categories ( categories (*) ),
          subcategories ( * )
        `, { count: 'exact' })
        .eq('subcategory_id', sub.id)
        .eq('status', 'Published')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('subcategory_id', sub.id)
        .eq('status', 'Published'),
    ]);

    if (error || countError) {
      console.error('[supabase] getPostsBySubcategory error:', error?.message, countError?.message);
      return { posts: [], total: 0 };
    }
    return {
      posts: (data as unknown as PostRow[]).map(mapPost),
      total: totalCount ?? count ?? 0,
    };
  }, { label: 'getPostsBySubcategory' });
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
      post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
    `)
    .eq('status', 'Published')
    .ilike('title', `%${escapeIlike(q)}%`)
    .limit(20);

  if (error) {
    console.error('[supabase] searchPosts error:', error.message);
    return [];
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

// ---------------------------------------------------------------------------
// OS page: fetch posts tagged with a specific OS tag
// ---------------------------------------------------------------------------

export async function getPostsByTag(
  tagSlug: string,
  page = 1,
  pageSize = 3
): Promise<{ posts: Post[]; total: number }> {
  return retry(async () => {
    // First get the tag id
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .maybeSingle();

    if (!tag) return { posts: [], total: 0 };

    // Get total count
    const { count } = await supabase
      .from('post_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id);

    // Get paginated posts
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: postTags, error } = await supabase
      .from('post_tags')
      .select('post_id')
      .eq('tag_id', tag.id)
      .order('post_id', { ascending: false })
      .range(from, to);

    if (error || !postTags || postTags.length === 0) {
      return { posts: [], total: count ?? 0 };
    }

    const postIds = postTags.map((pt) => pt.post_id);

    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
      `)
      .eq('status', 'Published')
      .in('id', postIds)
      .order('published_at', { ascending: false });

    return {
      posts: (posts as unknown as PostRow[]).map(mapPost),
      total: count ?? 0,
    };
  }, { label: `getPostsByTag:${tagSlug}` });
}

// Initial load for OS page: 1 post per OS tag
const OS_TAGS = ['android', 'ios', 'windows', 'macos', 'linux', 'other-os'];

export async function getInitialOSPosts(): Promise<
  { tag: string; tagName: string; posts: Post[] }[]
> {
  return retry(async () => {
    const results = await Promise.all(
      OS_TAGS.map(async (tagSlug) => {
        const tagData = await supabase
          .from('tags')
          .select('name')
          .eq('slug', tagSlug)
          .maybeSingle();

        const { posts } = await getPostsByTag(tagSlug, 1, 1);
        return {
          tag: tagSlug,
          tagName: tagData?.data?.name ?? tagSlug,
          posts,
        };
      })
    );
    return results;
  }, { label: 'getInitialOSPosts' });
}

// ---------------------------------------------------------------------------
// Sub-nav filtering: fetch posts by post_type
// ---------------------------------------------------------------------------

export async function getPostsByType(
  postType: string,
  page = 1,
  pageSize = 3
): Promise<{ posts: Post[]; total: number }> {
  return retry(async () => {
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Published')
      .eq('post_type', postType);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
      `)
      .eq('status', 'Published')
      .eq('post_type', postType)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[supabase] getPostsByType error:', error.message);
      return { posts: [], total: 0 };
    }

    return {
      posts: (data as unknown as PostRow[]).map(mapPost),
      total: count ?? 0,
    };
  }, { label: `getPostsByType:${postType}` });
}

// Initial load for mobile/laptop pages: 1 post per type
const SUB_NAV_TYPES = ['News', 'Review', 'Guide', 'Opinion'];

export async function getInitialTypePosts(): Promise<
  { type: string; posts: Post[] }[]
> {
  return retry(async () => {
    const results = await Promise.all(
      SUB_NAV_TYPES.map(async (postType) => {
        const { posts } = await getPostsByType(postType, 1, 1);
        return { type: postType, posts };
      })
    );
    return results;
  }, { label: 'getInitialTypePosts' });
}

// ---------------------------------------------------------------------------
// Featured posts
// ---------------------------------------------------------------------------

export async function getFeaturedPosts(pageSize = 6): Promise<Post[]> {
  return retry(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
      `)
      .eq('status', 'Published')
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(pageSize);

    if (error) {
      console.error('[supabase] getFeaturedPosts error:', error.message);
      return [];
    }
    return (data as unknown as PostRow[]).map(mapPost);
  }, { label: 'getFeaturedPosts' });
}

// ---------------------------------------------------------------------------
// Posts by category slug with pagination
// ---------------------------------------------------------------------------

export async function getPostsByCategory(
  categorySlug: string,
  page = 1,
  pageSize = 6
): Promise<{ posts: Post[]; total: number }> {
  return retry(async () => {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (!cat) return { posts: [], total: 0 };

    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Published')
      .eq('category_id', cat.id);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!posts_category_id_fkey (*),
        authors!posts_author_id_fkey (*),
        post_tags ( tags (*) ),
        post_categories ( categories (*) ),
        subcategories ( * )
      `)
      .eq('status', 'Published')
      .eq('category_id', cat.id)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[supabase] getPostsByCategory error:', error.message);
      return { posts: [], total: 0 };
    }

    return {
      posts: (data as unknown as PostRow[]).map(mapPost),
      total: count ?? 0,
    };
  }, { label: `getPostsByCategory:${categorySlug}` });
}

export async function getPostsByIds(ids: number[]): Promise<Post[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories!posts_category_id_fkey (*),
      authors!posts_author_id_fkey (*),
      post_tags ( tags (*) ),
      post_categories ( categories (*) ),
        subcategories ( * )
    `)
    .in('id', ids)
    .eq('status', 'Published');

  if (error) {
    console.error('[supabase] getPostsByIds error:', error.message);
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