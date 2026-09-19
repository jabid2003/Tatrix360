import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';

// ---------------------------------------------------------------------------
// Homepage Featured Articles — curated per-category on the homepage.
// Extracted from lib/sections.ts (Q2) to keep the data layer navigable.
// lib/sections.ts re-exports everything below for backward compatibility.
// ---------------------------------------------------------------------------

export interface HomepageFeatured {
  id: string;
  categorySlug: string;
  articleId: string;
  sortOrder: number;
  isVisible: boolean;
  headingIcon?: string | null;
}

export async function getHomepageFeatured(): Promise<HomepageFeatured[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_featured')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return (data as any[]).map((r) => ({
      id: r.id,
      categorySlug: r.category_slug,
      articleId: r.article_id,
      sortOrder: r.sort_order ?? 0,
      isVisible: r.is_visible ?? true,
      headingIcon: r.heading_icon ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getHomepageFeaturedByCategory(categorySlug: string): Promise<HomepageFeatured[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_featured')
      .select('*')
      .eq('category_slug', categorySlug)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return (data as any[]).map((r) => ({
      id: r.id,
      categorySlug: r.category_slug,
      articleId: r.article_id,
      sortOrder: r.sort_order ?? 0,
      isVisible: r.is_visible ?? true,
      headingIcon: r.heading_icon ?? null,
    }));
  } catch {
    return [];
  }
}

export async function addHomepageFeatured(categorySlug: string, articleId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { count } = await supabaseAdmin
      .from('homepage_featured')
      .select('*', { count: 'exact', head: true })
      .eq('category_slug', categorySlug);
    const nextOrder = (count ?? 0) + 1;
    const { error } = await supabaseAdmin
      .from('homepage_featured')
      .insert({ category_slug: categorySlug, article_id: articleId, sort_order: nextOrder, is_visible: true });
    if (error) return { ok: false, error: error.message };
    void logAdminActivity('create', 'homepage_featured', null, categorySlug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to add.' };
  }
}

export async function removeHomepageFeatured(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from('homepage_featured').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    void logAdminActivity('delete', 'homepage_featured', id);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to remove.' };
  }
}

export async function toggleHomepageFeaturedVisibility(id: string, isVisible: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('homepage_featured')
      .update({ is_visible: isVisible })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to toggle.' };
  }
}

export async function renameHomepageFeatured(oldSlug: string, newSlug: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('homepage_featured')
      .update({ category_slug: newSlug })
      .eq('category_slug', oldSlug);
    if (error) return { ok: false, error: error.message };
    void logAdminActivity('update', 'homepage_featured', null, `${oldSlug} -> ${newSlug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to rename.' };
  }
}

export async function updateHeadingIcon(categorySlug: string, icon: string | null): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('homepage_featured')
      .update({ heading_icon: icon })
      .eq('category_slug', categorySlug);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update icon.' };
  }
}

export async function reorderHomepageFeatured(orderedIds: string[]): Promise<{ ok: boolean; error?: string }> {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('homepage_featured')
        .update({ sort_order: i })
        .eq('id', orderedIds[i]);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to reorder.' };
  }
}
