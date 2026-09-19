import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getSiteSettings, updateSiteSettings } from '@/lib/site-settings';
import { pickStr, pickRawStr, pickBool } from '@/lib/api-helpers';

export async function GET() {
  const s = await getSiteSettings();
  return NextResponse.json({ ok: true, settings: s });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  const has = (camel: string, snake: string) => camel in body || snake in body;
  const res = await updateSiteSettings({
    siteName: pickStr(body, 'siteName', 'site_name'),
    logoUrl: pickRawStr(body, 'logoUrl', 'logo_url'),
    description: pickRawStr(body, 'description'),
    copyrightText: pickRawStr(body, 'copyrightText', 'copyright_text'),
    socialTwitter: pickRawStr(body, 'socialTwitter', 'social_twitter'),
    socialGithub: pickRawStr(body, 'socialGithub', 'social_github'),
    socialYoutube: pickRawStr(body, 'socialYoutube', 'social_youtube'),
    socialInstagram: pickRawStr(body, 'socialInstagram', 'social_instagram'),
    showNewsletter: has('showNewsletter', 'show_newsletter') ? pickBool(body, 'showNewsletter', 'show_newsletter', true) : undefined,
    showUserReviews: has('showUserReviews', 'show_user_reviews') ? pickBool(body, 'showUserReviews', 'show_user_reviews', false) : undefined,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
