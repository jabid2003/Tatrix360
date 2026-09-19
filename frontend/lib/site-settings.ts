import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';
import { sanitizeText, sanitizeUrl } from '@/lib/sanitize';

export interface SiteSettings {
  id: number;
  siteName: string;
  logoUrl?: string;
  description: string;
  copyrightText?: string;
  socialTwitter?: string;
  socialGithub?: string;
  socialYoutube?: string;
  socialInstagram?: string;
  showNewsletter: boolean;
  showUserReviews: boolean;
  updatedAt?: string;
}

interface Row {
  id: number;
  site_name: string;
  logo_url: string | null;
  description: string;
  copyright_text: string | null;
  social_twitter: string | null;
  social_github: string | null;
  social_youtube: string | null;
  social_instagram: string | null;
  show_newsletter: boolean | null;
  show_user_reviews: boolean | null;
  updated_at: string | null;
}

function mapRow(r: Row): SiteSettings {
  return {
    id: r.id,
    siteName: r.site_name,
    logoUrl: r.logo_url ?? undefined,
    description: r.description,
    copyrightText: r.copyright_text ?? undefined,
    socialTwitter: r.social_twitter ?? undefined,
    socialGithub: r.social_github ?? undefined,
    socialYoutube: r.social_youtube ?? undefined,
    socialInstagram: r.social_instagram ?? undefined,
    showNewsletter: r.show_newsletter ?? true,
    showUserReviews: r.show_user_reviews ?? false,
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return null;
    return mapRow(data as unknown as Row);
  } catch { return null; }
}

export async function updateSiteSettings(input: Partial<{
  siteName: string; logoUrl: string; description: string; copyrightText: string;
  socialTwitter: string; socialGithub: string; socialYoutube: string; socialInstagram: string;
  showNewsletter: boolean; showUserReviews: boolean;
}>): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.siteName !== undefined) patch.site_name = sanitizeText(input.siteName, 120) || 'Tatrix360';
  if (input.description !== undefined) patch.description = sanitizeText(input.description, 500) || '';
  if (input.copyrightText !== undefined) patch.copyright_text = input.copyrightText ? sanitizeText(input.copyrightText, 300) : null;
  if (input.logoUrl !== undefined) patch.logo_url = input.logoUrl ? sanitizeUrl(input.logoUrl) ?? null : null;
  if (input.socialTwitter !== undefined) patch.social_twitter = input.socialTwitter ? sanitizeUrl(input.socialTwitter) ?? null : null;
  if (input.socialGithub !== undefined) patch.social_github = input.socialGithub ? sanitizeUrl(input.socialGithub) ?? null : null;
  if (input.socialYoutube !== undefined) patch.social_youtube = input.socialYoutube ? sanitizeUrl(input.socialYoutube) ?? null : null;
  if (input.socialInstagram !== undefined) patch.social_instagram = input.socialInstagram ? sanitizeUrl(input.socialInstagram) ?? null : null;
  if (input.showNewsletter !== undefined) patch.show_newsletter = !!input.showNewsletter;
  if (input.showUserReviews !== undefined) patch.show_user_reviews = !!input.showUserReviews;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabaseAdmin.from('site_settings').update(patch).eq('id', 1);
  if (error) return { ok: false, error: error.message };
  void logAdminActivity('update', 'site_settings', 1);
  return { ok: true };
}
