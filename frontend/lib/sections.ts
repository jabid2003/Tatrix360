import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';

// ---------------------------------------------------------------------------
// New architecture: main_categories -> category_sections -> articles
// (+ top_articles for the homepage shortcut box).
//
// Every public read is defensive: if the new tables don't exist yet (reset
// SQL not run), we return [] instead of crashing the build.
// ---------------------------------------------------------------------------

export interface MainCategory {
  id: string;
  slug: string;
  displayName: string;
  description?: string;
  displayOrder?: number;
  showInNavbar?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySection {
  id: string;
  mainCategoryId: string;
  title: string;
  slug: string;
  sortOrder: number;
  isHidden: boolean;
  mainCategory?: MainCategory;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content?: string;
  thumbnailUrl?: string;
  mainCategoryId: string;
  sectionId?: string;
  authorId?: number;
  author?: { id: number; name: string; slug: string; avatar?: string; bio?: string; role?: string } | null;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'Draft' | 'Published' | 'Archived';
  publishedAt?: string;
  isVisible?: boolean;
  isLatest?: boolean;
  isPinned?: boolean;
  latestOrder?: number;
  pinnedOrder?: number;
  articleType?: 'standard' | 'listicle';
  introContent?: string;
  conclusionContent?: string;
  readAlsoIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  mainCategory?: MainCategory;
  section?: Pick<CategorySection, 'id' | 'title' | 'slug'>;
}

export interface TopArticle {
  articleId: string;
  sortOrder: number;
  article?: Article;
}

// The 7 hubs, in navbar order. Used as a fallback so the navbar still
// renders even when the DB is empty / reset SQL not run yet.
export const HUB_LINKS: { slug: string; displayName: string }[] = [
  { slug: 'os-news', displayName: 'OS News' },
  { slug: 'ai-news', displayName: 'AI News' },
  { slug: 'app-updates', displayName: 'App Updates' },
  { slug: 'mobile', displayName: 'Mobile' },
  { slug: 'laptop', displayName: 'Laptop' },
  { slug: 'gadgets', displayName: 'Gadgets' },
  { slug: 'do-you-know', displayName: 'Do You Know?' },
];

export const HUB_SLUGS = new Set(HUB_LINKS.map((h) => h.slug));

// ---------------------------------------------------------------------------
// Row types + mappers
// ---------------------------------------------------------------------------

interface MainCategoryRow {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  display_order: number | null;
  show_in_navbar: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SectionRow {
  id: string;
  main_category_id: string;
  title: string;
  slug: string;
  sort_order: number | null;
  is_hidden: boolean | null;
  main_categories?: MainCategoryRow | null;
}

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  thumbnail_url: string | null;
  main_category_id: string;
  section_id: string | null;
  author_id: number | null;
  seo_title: string | null;
  seo_description: string | null;
  status: string | null;
  published_at: string | null;
  is_visible: boolean | null;
  is_latest: boolean | null;
  is_pinned: boolean | null;
  latest_order: number | null;
  pinned_order: number | null;
  article_type: string | null;
  intro_content: string | null;
  conclusion_content: string | null;
  read_also_ids: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  main_categories?: MainCategoryRow | null;
  category_sections?: { id: string; title: string; slug: string } | null;
  authors?: { id: number; name: string; slug: string; avatar: string | null; avatar_url: string | null; bio: string | null; role: string | null } | null;
}

function mapMainCategory(r: MainCategoryRow): MainCategory {
  return {
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    description: r.description ?? undefined,
    displayOrder: r.display_order ?? 0,
    showInNavbar: r.show_in_navbar ?? true,
    isActive: r.is_active ?? true,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

function mapSection(r: SectionRow): CategorySection {
  return {
    id: r.id,
    mainCategoryId: r.main_category_id,
    title: r.title,
    slug: r.slug,
    sortOrder: r.sort_order ?? 0,
    isHidden: r.is_hidden ?? false,
    mainCategory: r.main_categories ? mapMainCategory(r.main_categories) : undefined,
  };
}

function mapArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    subtitle: r.subtitle ?? undefined,
    content: r.content ?? undefined,
    thumbnailUrl: r.thumbnail_url ?? undefined,
    mainCategoryId: r.main_category_id,
    sectionId: r.section_id ?? undefined,
    authorId: r.author_id ?? undefined,
    author: r.authors ? { id: r.authors.id, name: r.authors.name, slug: r.authors.slug, avatar: r.authors.avatar_url ?? r.authors.avatar ?? undefined, bio: r.authors.bio ?? undefined, role: r.authors.role ?? undefined } : undefined,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    status: (r.status as Article['status']) ?? 'Published',
    publishedAt: r.published_at ?? r.created_at ?? undefined,
    isVisible: r.is_visible ?? true,
    isLatest: r.is_latest ?? true,
    isPinned: r.is_pinned ?? false,
    latestOrder: r.latest_order ?? 0,
    pinnedOrder: r.pinned_order ?? 0,
    articleType: (r.article_type as Article['articleType']) ?? 'standard',
    introContent: r.intro_content ?? undefined,
    conclusionContent: r.conclusion_content ?? undefined,
    readAlsoIds: r.read_also_ids && r.read_also_ids.length > 0 ? r.read_also_ids : undefined,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    mainCategory: r.main_categories ? mapMainCategory(r.main_categories) : undefined,
    section: r.category_sections
      ? { id: r.category_sections.id, title: r.category_sections.title, slug: r.category_sections.slug }
      : undefined,
  };
}

const ARTICLE_SELECT = `
  *,
  main_categories (*),
  category_sections (id, title, slug),
  authors (*)
`;

// ---------------------------------------------------------------------------
// Public reads (anon client)
// ---------------------------------------------------------------------------

export async function getMainCategories(): Promise<MainCategory[]> {
  try {
    const { data, error } = await supabase
      .from('main_categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error || !data) return [];
    const rows = data as unknown as MainCategoryRow[];
    return rows.map(mapMainCategory).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch {
    return [];
  }
}

export async function getNavbarCategories(): Promise<MainCategory[]> {
  try {
    const { data, error } = await supabase
      .from('main_categories')
      .select('*')
      .eq('is_active', true)
      .eq('show_in_navbar', true)
      .order('display_order', { ascending: true });
    if (error || !data) return getMainCategories();
    return (data as unknown as MainCategoryRow[]).map(mapMainCategory);
  } catch {
    return getMainCategories();
  }
}

export async function getMainCategoryBySlug(slug: string): Promise<MainCategory | null> {
  try {
    const { data, error } = await supabase
      .from('main_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    return mapMainCategory(data as unknown as MainCategoryRow);
  } catch {
    return null;
  }
}

export async function getSectionsByCategory(
  mainCategoryId: string,
  includeHidden = false
): Promise<CategorySection[]> {
  try {
    let query = supabase
      .from('category_sections')
      .select('*, main_categories (*)')
      .eq('main_category_id', mainCategoryId)
      .order('sort_order', { ascending: true });
    if (!includeHidden) query = query.eq('is_hidden', false);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as unknown as SectionRow[]).map(mapSection);
  } catch {
    return [];
  }
}

export async function getSectionsByCategorySlug(
  categorySlug: string,
  includeHidden = false
): Promise<CategorySection[]> {
  const cat = await getMainCategoryBySlug(categorySlug);
  if (!cat) return [];
  return getSectionsByCategory(cat.id, includeHidden);
}

export async function getSectionByCategoryAndSlug(
  categorySlug: string,
  sectionSlug: string
): Promise<{ section: CategorySection; category: MainCategory } | null> {
  try {
    const cat = await getMainCategoryBySlug(categorySlug);
    if (!cat) return null;
    const { data, error } = await supabase
      .from('category_sections')
      .select('*, main_categories (*)')
      .eq('main_category_id', cat.id)
      .eq('slug', sectionSlug)
      .maybeSingle();
    if (error || !data) return null;
    const section = mapSection(data as unknown as SectionRow);
    return { section, category: cat };
  } catch {
    return null;
  }
}

export async function getArticlesBySection(
  sectionId: string,
  limit = 6,
  offset = 0
): Promise<{ articles: Article[]; total: number }> {
  try {
    const { data, error, count } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('section_id', sectionId)
      .eq('status', 'Published')
      .eq('is_visible', true)
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { articles: [], total: 0 };
    return {
      articles: ((data ?? []) as unknown as ArticleRow[]).map(mapArticle),
      total: count ?? 0,
    };
  } catch {
    return { articles: [], total: 0 };
  }
}

export async function getArticlesBySectionAdmin(
  sectionId: string,
  limit = 50,
  offset = 0
): Promise<{ articles: Article[]; total: number }> {
  try {
    const { data, error, count } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { articles: [], total: 0 };
    return { articles: ((data ?? []) as unknown as ArticleRow[]).map(mapArticle), total: count ?? 0 };
  } catch { return { articles: [], total: 0 }; }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    return mapArticle(data as unknown as ArticleRow);
  } catch {
    return null;
  }
}

export async function getLatestArticles(limit = 12): Promise<Article[]> {
  return (await getLatestArticlesPaginated(limit, 0)).articles;
}

export async function getLatestArticlesPaginated(limit = 6, offset = 0): Promise<{ articles: Article[]; total: number }> {
  // Preferred: explicitly-marked latest articles (is_latest = true).
  const preferred = await queryLatestArticlesPaginated(limit, offset, true);
  if (preferred.articles.length > 0 || preferred.total > 0) return preferred;
  // Fallback: if nothing is marked latest (or the flag column is missing),
  // return the most recent published articles so the feed never renders empty.
  return queryLatestArticlesPaginated(limit, offset, false);
}

async function queryLatestArticlesPaginated(
  limit: number,
  offset: number,
  onlyLatest: boolean
): Promise<{ articles: Article[]; total: number }> {
  try {
    let q: any = supabase
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('status', 'Published')
      .eq('is_visible', true);
    if (onlyLatest) q = q.eq('is_latest', true);
    q = q.order('latest_order', { ascending: true })
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) return { articles: [], total: 0 };
    return { articles: ((data ?? []) as unknown as ArticleRow[]).map(mapArticle), total: count ?? 0 };
  } catch {
    return { articles: [], total: 0 };
  }
}

export async function getPinnedArticles(limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'Published')
      .eq('is_visible', true)
      .eq('is_pinned', true)
      .order('pinned_order', { ascending: true })
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as unknown as ArticleRow[]).map(mapArticle);
  } catch { return []; }
}

export async function getTopArticles(limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('top_articles')
      .select(`sort_order, articles (${ARTICLE_SELECT})`)
      .order('sort_order', { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    const out: Article[] = [];
    for (const row of data as unknown as { sort_order: number; articles: ArticleRow | null }[]) {
      if (row.articles) out.push(mapArticle(row.articles));
    }
    return out;
  } catch {
    return [];
  }
}

export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  const q = query.trim().replace(/[%_\\]/g, '\\$&');
  if (!q) return [];
  // Strip chars that would break the PostgREST .or() expression.
  const safe = q.replace(/[,()]/g, '');
  if (!safe) return [];
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .or(`title.ilike.%${safe}%,slug.ilike.%${safe}%`)
      .eq('status', 'Published')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as unknown as ArticleRow[]).map(mapArticle);
  } catch {
    return [];
  }
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (!ids || ids.length === 0) return [];
  const unique = [...new Set(ids)];
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .in('id', unique)
      .eq('status', 'Published')
      .eq('is_visible', true);
    if (error || !data) return [];
    const byId = new Map((data as unknown as ArticleRow[]).map((r) => [r.id, mapArticle(r)]));
    // Preserve the order the author chose in the admin picker.
    return unique.flatMap((id) => (byId.get(id) ? [byId.get(id)!] : []));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin reads/writes (service-role client — admin routes only)
// ---------------------------------------------------------------------------

export interface AdminArticleFilter {
  status?: 'Draft' | 'Published' | 'Archived';
  onlyLatest?: boolean;
  onlyPinned?: boolean;
  hidden?: boolean;
  articleType?: 'standard' | 'listicle';
  limit?: number;
  offset?: number;
}

export async function getAdminArticles(filter: AdminArticleFilter = {}): Promise<Article[]> {
  try {
    let q: any = supabaseAdmin.from('articles').select(ARTICLE_SELECT);
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.onlyLatest) q = q.eq('is_latest', true);
    if (filter.onlyPinned) q = q.eq('is_pinned', true);
    if (filter.hidden) q = q.eq('is_visible', false);
    if (filter.articleType) q = q.eq('article_type', filter.articleType);
    q = q.order('created_at', { ascending: false });
    if (filter.limit) q = q.limit(filter.limit);
    if (filter.offset) q = q.range(filter.offset, filter.offset + (filter.limit ?? 10) - 1);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as unknown as ArticleRow[]).map(mapArticle);
  } catch {
    return [];
  }
}

export async function getAdminArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapArticle(data as unknown as ArticleRow);
  } catch {
    return null;
  }
}

export interface ArticleInput {
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  thumbnailUrl?: string;
  mainCategoryId: string;
  sectionId?: string;
  authorId?: number | null;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'Draft' | 'Published' | 'Archived';
  publishedAt?: string | null;
  isVisible?: boolean;
  isLatest?: boolean;
  isPinned?: boolean;
  latestOrder?: number;
  pinnedOrder?: number;
  articleType?: 'standard' | 'listicle';
  introContent?: string;
  conclusionContent?: string;
  readAlsoIds?: string[];
}

export async function createArticle(
  input: ArticleInput
): Promise<{ ok: boolean; article?: Article; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle || null,
      content: input.content,
      thumbnail_url: input.thumbnailUrl || null,
      main_category_id: input.mainCategoryId,
      section_id: input.sectionId || null,
      author_id: input.authorId ?? null,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      status: input.status ?? 'Published',
      published_at: input.publishedAt ?? (input.status === 'Published' ? new Date().toISOString() : null),
      is_visible: input.isVisible ?? true,
      is_latest: input.isLatest ?? true,
      is_pinned: input.isPinned ?? false,
      latest_order: input.latestOrder ?? 0,
      pinned_order: input.pinnedOrder ?? 0,
      article_type: input.articleType ?? 'standard',
      intro_content: input.introContent || null,
      conclusion_content: input.conclusionContent || null,
      read_also_ids: input.readAlsoIds && input.readAlsoIds.length > 0 ? input.readAlsoIds : null,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message || 'Failed to create article.' };
  }
  const article = await getAdminArticleById((data as { id: string }).id);
  void logAdminActivity('create', 'article', (data as { id: string }).id, input.title);
  return { ok: true, article: article ?? undefined };
}

export async function updateArticle(
  id: string,
  input: ArticleInput
): Promise<{ ok: boolean; article?: Article; error?: string }> {
  const updateData: Record<string, any> = {
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle || null,
      content: input.content,
      main_category_id: input.mainCategoryId,
      section_id: input.sectionId || null,
      author_id: input.authorId ?? null,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      status: input.status ?? 'Published',
      published_at: input.publishedAt ?? undefined,
      is_visible: input.isVisible ?? true,
      is_latest: input.isLatest ?? true,
      is_pinned: input.isPinned ?? false,
      latest_order: input.latestOrder ?? 0,
      pinned_order: input.pinnedOrder ?? 0,
      article_type: input.articleType ?? 'standard',
      intro_content: input.introContent || null,
      conclusion_content: input.conclusionContent || null,
      updated_at: new Date().toISOString(),
    };
    if (input.thumbnailUrl !== undefined) {
      updateData.thumbnail_url = input.thumbnailUrl || null;
    }
    if (input.readAlsoIds !== undefined) {
      updateData.read_also_ids = input.readAlsoIds.length > 0 ? input.readAlsoIds : null;
    }
  const { error } = await supabaseAdmin
    .from('articles')
    .update(updateData)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  const article = await getAdminArticleById(id);
  void logAdminActivity('update', 'article', id, input.title);
  return { ok: true, article: article ?? undefined };
}

export async function deleteArticle(id: string): Promise<{ ok: boolean; error?: string }> {
  await supabaseAdmin.from('top_articles').delete().eq('article_id', id);
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  void logAdminActivity('delete', 'article', id);
  return { ok: true };
}

export interface SectionInput {
  mainCategoryId: string;
  title: string;
  slug: string;
  sortOrder?: number;
  isHidden?: boolean;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createSection(
  input: SectionInput
): Promise<{ ok: boolean; section?: CategorySection; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('category_sections')
    .insert({
      main_category_id: input.mainCategoryId,
      title: input.title.trim(),
      slug: (input.slug || slugify(input.title)).trim(),
      sort_order: input.sortOrder ?? 0,
      is_hidden: input.isHidden ?? false,
    })
    .select('*, main_categories (*)')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message || 'Failed to create section.' };
  }
  return { ok: true, section: mapSection(data as unknown as SectionRow) };
}

export async function updateSection(
  id: string,
  input: Partial<SectionInput>
): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.slug !== undefined) patch.slug = input.slug.trim();
  if (input.mainCategoryId !== undefined) patch.main_category_id = input.mainCategoryId;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isHidden !== undefined) patch.is_hidden = input.isHidden;
  const { error } = await supabaseAdmin.from('category_sections').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSection(id: string): Promise<{ ok: boolean; error?: string }> {
  // Articles in this section keep existing (section_id SET NULL by FK).
  const { error } = await supabaseAdmin.from('category_sections').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface MainCategoryInput {
  displayName: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  showInNavbar?: boolean;
  isActive?: boolean;
}

export async function createMainCategory(input: MainCategoryInput): Promise<{ ok: boolean; category?: MainCategory; error?: string }> {
  const { data, error } = await supabaseAdmin.from('main_categories').insert({
    slug: slugify(input.slug || input.displayName),
    display_name: input.displayName.trim(),
    description: input.description?.trim() || null,
    display_order: input.displayOrder ?? 0,
    show_in_navbar: input.showInNavbar ?? true,
    is_active: input.isActive ?? true,
  }).select('*').single();
  if (error || !data) return { ok: false, error: error?.message || 'Failed to create category.' };
  return { ok: true, category: mapMainCategory(data as unknown as MainCategoryRow) };
}

export async function updateMainCategory(id: string, input: Partial<MainCategoryInput>): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.displayName !== undefined) patch.display_name = input.displayName.trim();
  if (input.slug !== undefined) patch.slug = slugify(input.slug);
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.displayOrder !== undefined) patch.display_order = input.displayOrder;
  if (input.showInNavbar !== undefined) patch.show_in_navbar = input.showInNavbar;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabaseAdmin.from('main_categories').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteMainCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  // Prevent deleting if articles exist (RESTRICT FK) — inform caller
  const { count } = await supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).eq('main_category_id', id);
  if (count && count > 0) return { ok: false, error: 'Cannot delete category with existing articles.' };
  const { error } = await supabaseAdmin.from('main_categories').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorderMainCategories(orderedIds: string[]): Promise<{ ok: boolean; error?: string }> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabaseAdmin.from('main_categories').update({ display_order: i, updated_at: new Date().toISOString() }).eq('id', orderedIds[i]);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pinTopArticle(
  articleId: string,
  sortOrder = 0
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('top_articles')
    .upsert({ article_id: articleId, sort_order: sortOrder }, { onConflict: 'article_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unpinTopArticle(articleId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from('top_articles').delete().eq('article_id', articleId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Mark/unmark an article as "Latest". When marking, assign the next available
// latest_order so the home/latest feeds include it deterministically.
export async function setArticleLatest(
  articleId: string,
  isLatest: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!isLatest) {
      const { error } = await supabaseAdmin
        .from('articles')
        .update({ is_latest: false, updated_at: new Date().toISOString() })
        .eq('id', articleId);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    const { count } = await supabaseAdmin
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('is_latest', true);
    const nextOrder = (count ?? 0) + 1;

    const { error } = await supabaseAdmin
      .from('articles')
      .update({ is_latest: true, latest_order: nextOrder, updated_at: new Date().toISOString() })
      .eq('id', articleId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update latest flag.' };
  }
}

export async function getTopArticleIds(): Promise<{ articleId: string; sortOrder: number }[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('top_articles')
      .select('article_id, sort_order')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return (data as { article_id: string; sort_order: number }[]).map((r) => ({
      articleId: r.article_id,
      sortOrder: r.sort_order ?? 0,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Homepage Featured Articles — moved to lib/homepage-featured.ts (Q2).
// Re-exported here so existing imports keep working.
// ---------------------------------------------------------------------------

export {
  type HomepageFeatured,
  getHomepageFeatured,
  getHomepageFeaturedByCategory,
  addHomepageFeatured,
  removeHomepageFeatured,
  toggleHomepageFeaturedVisibility,
  renameHomepageFeatured,
  updateHeadingIcon,
  reorderHomepageFeatured,
} from '@/lib/homepage-featured';
