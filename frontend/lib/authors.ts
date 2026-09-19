import { supabase, SITE_URL } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sanitizeText, sanitizeMultiline, sanitizeUrl, slugify } from '@/lib/sanitize';

export interface AuthorFull {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  role?: string;
  avatarUrl?: string;
  avatar?: string;
  websiteUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthorRowFull {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  avatar_url: string | null;
  role: string | null;
  website_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

function mapAuthorFull(r: AuthorRowFull): AuthorFull {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    bio: r.bio ?? undefined,
    avatar: r.avatar ?? r.avatar_url ?? undefined,
    avatarUrl: r.avatar_url ?? r.avatar ?? undefined,
    role: r.role ?? undefined,
    websiteUrl: r.website_url ?? undefined,
    isActive: r.is_active ?? true,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function getAuthorsAdmin(): Promise<AuthorFull[]> {
  const { data, error } = await supabaseAdmin
    .from('authors')
    .select('*')
    .order('id', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return (data as unknown as AuthorRowFull[]).map(mapAuthorFull);
}

export async function getActiveAuthors(): Promise<AuthorFull[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error || !data) return [];
  return (data as unknown as AuthorRowFull[]).map(mapAuthorFull);
}

export async function getAuthorById(id: number): Promise<AuthorFull | null> {
  const { data, error } = await supabaseAdmin.from('authors').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapAuthorFull(data as unknown as AuthorRowFull);
}

export interface AuthorInput {
  name: string;
  bio?: string;
  role?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export async function createAuthor(input: AuthorInput): Promise<{ ok: boolean; author?: AuthorFull; error?: string }> {
  const name = sanitizeText(input.name, 120);
  if (!name) return { ok: false, error: 'Name is required.' };
  const slug = slugify(name);
  if (!slug) return { ok: false, error: 'Could not derive slug.' };
  const bio = input.bio ? sanitizeMultiline(input.bio, 2000) : null;
  const role = input.role ? sanitizeText(input.role, 120) : null;
  const avatarUrl = sanitizeUrl(input.avatarUrl ?? '') ?? null;
  const websiteUrl = input.websiteUrl ? sanitizeUrl(input.websiteUrl) ?? null : null;
  if (input.websiteUrl && input.websiteUrl.trim() && !websiteUrl) return { ok: false, error: 'Website URL must be http(s) or site-relative.' };
  // uniqueness check
  const { data: exists } = await supabaseAdmin.from('authors').select('id').eq('slug', slug).maybeSingle();
  if (exists) return { ok: false, error: 'An author with this slug already exists.' };

  const { data, error } = await supabaseAdmin
    .from('authors')
    .insert({
      name,
      slug,
      bio,
      role,
      avatar: avatarUrl,
      avatar_url: avatarUrl,
      website_url: websiteUrl,
      is_active: input.isActive ?? true,
    })
    .select('*')
    .single();
  if (error || !data) return { ok: false, error: error?.message || 'Failed to create author.' };
  return { ok: true, author: mapAuthorFull(data as unknown as AuthorRowFull) };
}

export async function updateAuthor(id: number, input: Partial<AuthorInput>): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = sanitizeText(input.name, 120);
    if (!name) return { ok: false, error: 'Name cannot be empty.' };
    patch.name = name;
    patch.slug = slugify(name);
  }
  if (input.bio !== undefined) patch.bio = input.bio ? sanitizeMultiline(input.bio, 2000) : null;
  if (input.role !== undefined) patch.role = input.role ? sanitizeText(input.role, 120) : null;
  if (input.avatarUrl !== undefined) {
    const url = input.avatarUrl ? sanitizeUrl(input.avatarUrl) : null;
    if (input.avatarUrl && input.avatarUrl.trim() && !url) return { ok: false, error: 'Avatar URL invalid.' };
    patch.avatar = url;
    patch.avatar_url = url;
  }
  if (input.websiteUrl !== undefined) {
    if (!input.websiteUrl || !input.websiteUrl.trim()) patch.website_url = null;
    else {
      const url = sanitizeUrl(input.websiteUrl);
      if (!url) return { ok: false, error: 'Website URL invalid.' };
      patch.website_url = url;
    }
  }
  if (input.isActive !== undefined) patch.is_active = !!input.isActive;
  patch.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from('authors').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAuthor(id: number): Promise<{ ok: boolean; error?: string }> {
  // Soft strategy: null out FKs then delete — but per spec use author_id = null OR deactivate.
  // We nullify references in both stacks then delete row. Service_role bypasses RLS.
  await supabaseAdmin.from('posts').update({ author_id: null }).eq('author_id', id);
  await supabaseAdmin.from('articles').update({ author_id: null }).eq('author_id', id);
  const { error } = await supabaseAdmin.from('authors').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function toggleAuthorActive(id: number, isActive: boolean): Promise<{ ok: boolean; error?: string }> {
  return updateAuthor(id, { isActive });
}
