import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products';
import { getSiteSettings } from '@/lib/site-settings';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ProductGallery } from '@/components/site/product-gallery';
import { Star, Check, X, Award, Calendar, Tag, Shield, Smartphone, Cpu, HardDrive, Camera, Battery, Settings2, Wifi, Box, Ruler, Layers, Monitor, Thermometer, Activity, Droplets, Gauge, Eye, Volume2, Globe, Sun, Usb, Cable, Fingerprint, Heart, Vibrate, Bluetooth, Link2 } from 'lucide-react';

export const revalidate = 60;

const CAT_MAP: Record<string, { cat: 'mobile'|'laptop'|'gadget'; label: string }> = {
  mobiles: { cat: 'mobile', label: 'Mobiles' },
  laptops: { cat: 'laptop', label: 'Laptops' },
  gadgets: { cat: 'gadget', label: 'Gadgets' },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Display: <Monitor className="h-4 w-4" />,
  Monitor: <Monitor className="h-4 w-4" />,
  Performance: <Cpu className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
  'Memory & Storage': <HardDrive className="h-4 w-4" />,
  'RAM & Storage': <HardDrive className="h-4 w-4" />,
  Memory: <HardDrive className="h-4 w-4" />,
  HardDrive: <HardDrive className="h-4 w-4" />,
  Cameras: <Camera className="h-4 w-4" />,
  Camera: <Camera className="h-4 w-4" />,
  'Battery & Charging': <Battery className="h-4 w-4" />,
  Battery: <Battery className="h-4 w-4" />,
  Software: <Settings2 className="h-4 w-4" />,
  Settings: <Settings2 className="h-4 w-4" />,
  Settings2: <Settings2 className="h-4 w-4" />,
  Connectivity: <Wifi className="h-4 w-4" />,
  Wifi: <Wifi className="h-4 w-4" />,
  Bluetooth: <Bluetooth className="h-4 w-4" />,
  'Build & Design': <Box className="h-4 w-4" />,
  Build: <Box className="h-4 w-4" />,
  Box: <Box className="h-4 w-4" />,
  'Dimensions & Weight': <Ruler className="h-4 w-4" />,
  Dimensions: <Ruler className="h-4 w-4" />,
  Ruler: <Ruler className="h-4 w-4" />,
  'Special Features': <Star className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Zap: <Award className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  Smartphone: <Smartphone className="h-4 w-4" />,
  Laptop: <Award className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Thermometer: <Thermometer className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Droplets: <Droplets className="h-4 w-4" />,
  Gauge: <Gauge className="h-4 w-4" />,
  Vibrate: <Vibrate className="h-4 w-4" />,
  Fingerprint: <Fingerprint className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  Volume2: <Volume2 className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Sun: <Sun className="h-4 w-4" />,
  Usb: <Usb className="h-4 w-4" />,
  Cable: <Cable className="h-4 w-4" />,
  Nfc: <Wifi className="h-4 w-4" />,
};

function SpecIcon({ title, fallback }: { title: string; fallback?: string }) {
  const icon = ICON_MAP[title] ?? (fallback ? ICON_MAP[fallback] : null) ?? <Layers className="h-4 w-4" />;
  return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">{icon}</span>;
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }) {
  const p = await getProductBySlug(params.slug).catch(() => null);
  if (!p) return {};
  const title = `${p.name} — Full Specs | Tatrix360`;
  const description = p.shortDescription || p.description?.slice(0,155) || `Full specs for ${p.name}`;
  const url = `/specs/${params.category}/${p.slug}`;
  const images = p.thumbnailUrl ? [{ url: p.thumbnailUrl, alt: p.name }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Tatrix360', type: 'website', images },
    twitter: { card: 'summary_large_image', title, description, images: p.thumbnailUrl ? [p.thumbnailUrl] : undefined },
  };
}

export default async function FullSpecPage({ params }: { params: { category: string; slug: string } }) {
  const cat = CAT_MAP[params.category];
  if (!cat) notFound();
  const product = await getProductBySlug(params.slug);
  if (!product || product.category !== cat.cat) notFound();
  const siteSettings = await getSiteSettings().catch(() => null);
  const showReviewsGlobal = siteSettings?.showUserReviews ?? false;
  const showReviews = showReviewsGlobal && product.showUserReviews;

  // Fetch Read Also articles if any
  let readAlsoArticles: { id: string; title: string; slug: string; mainCategory?: { slug: string; displayName: string } | null }[] = [];
  if (product.readAlsoIds && product.readAlsoIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug, main_categories (slug, display_name)')
      .in('id', product.readAlsoIds);
    if (data) {
      readAlsoArticles = (data as any[]).map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        mainCategory: a.main_categories,
      }));
    }
  }

  const gallery = product.images.length ? product.images : (product.thumbnailUrl ? [product.thumbnailUrl] : []);
  const mainImg = product.thumbnailUrl || gallery[0];

  return (
    <main className="container-page py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link><span>›</span>
        <Link href={`/specs/${params.category}`} className="hover:text-foreground capitalize">{cat.label}</Link>
        {product.brand && <><span>›</span><span>{product.brand}</span></>}
        <span>›</span><span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Images */}
        <div className="lg:col-span-4">
          <ProductGallery images={gallery} productName={product.name} thumbnailUrl={product.thumbnailUrl} />
        </div>

        {/* Middle */}
        <div className="lg:col-span-5">
          {product.brand && <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{product.brand}</p>}
          <h1 className="mt-1 font-serif text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
          {product.shortDescription && <p className="mt-2 text-sm text-muted-foreground">{product.shortDescription}</p>}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="mx-auto flex justify-center text-muted-foreground"><Calendar className="h-4 w-4" /></div>
              <p className="mt-1 text-[11px] text-muted-foreground">Launch Date</p>
              <p className="text-xs font-semibold sm:text-sm">{product.launchDateText ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="mx-auto flex justify-center text-muted-foreground"><Tag className="h-4 w-4" /></div>
              <p className="mt-1 text-[11px] text-muted-foreground">Starting Price</p>
              <p className="text-xs font-bold sm:text-sm">{product.priceText ?? '—'}</p>
              {product.isExpectedPrice && <p className="text-[11px] text-muted-foreground">(Expected)</p>}
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="flex justify-center text-amber-500"><Star className="h-4 w-4 fill-amber-500" /></div>
              <p className="text-sm font-bold">{product.rating ? `${product.rating} / 5` : '—'}</p>
              <p className="text-[11px] text-muted-foreground">{product.ratingCountText ?? ''}</p>
            </div>
          </div>

          {product.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}
        </div>

        {/* Right price card */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-2xl font-bold">{product.priceText ?? '—'} {product.isExpectedPrice && <span className="text-xs font-normal text-muted-foreground">(Expected)</span>}</p>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Check Latest Price <span>↗</span></button>
            {product.keySpecs.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-blue-100 pt-4 dark:border-blue-900/30">
                {product.keySpecs.slice(0,4).map((k, i) => (
                  <div key={i} className="text-center">
                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-blue-600"><Smartphone className="h-5 w-5" /></div>
                    <p className="mt-1 text-xs font-bold">{k.value || k.label}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">{k.sublabel || k.label}</p>
                  </div>
                ))}
              </div>
            )}
            {product.description && <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">{product.description}</p>}
          </div>
        </div>
      </div>

      {/* Specs + Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Specs grid */}
        <div className="lg:col-span-8">
          <h2 className="font-semibold">Full Specifications</h2>
          {product.specs.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No specifications added yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.specs.map((section, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <SpecIcon title={section.title} />
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                  <dl className="mt-3 space-y-2">
                    {section.fields.map((f, i) => (
                      <div key={i} className="flex justify-between gap-2 text-xs sm:text-sm">
                        <dt className="w-1/2 text-muted-foreground">{f.label}</dt>
                        <dd className="w-1/2 text-right font-medium sm:text-left">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {/* Special Features full width if exists */}
              {product.specialFeatures.length > 0 && (
                <div className="rounded-xl border border-border bg-blue-50/40 p-3 sm:col-span-2 lg:col-span-3 dark:bg-blue-950/10">
                  <div className="flex items-center gap-2">
                    <SpecIcon title="Special Features" />
                    <h3 className="text-sm font-semibold">Special Features</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.specialFeatures.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs"><Check className="h-3 w-3 text-blue-600" /> {f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:col-span-4">
          {/* Quick Facts */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Tag className="h-4 w-4 text-blue-600" /> Quick Facts</h3>
            <div className="mt-3 divide-y divide-border text-sm">
              <div className="flex justify-between py-2"><span className="text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-4 border-t-2 border-foreground/30" /> Brand</span><span className="font-medium">{product.brand ?? '—'}</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Model</span><span className="font-medium">{product.name}</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Launch Date</span><span className="font-medium">{product.launchDateText ?? '—'} {product.isExpectedPrice ? '(Expected)' : ''}</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Price</span><span className="font-medium">{product.priceText ?? '—'} {product.isExpectedPrice ? '(Expected)' : ''}</span></div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="text-blue-600">☺</span> Pros & Cons</h3>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700"><Check className="h-3.5 w-3.5 rounded-full bg-green-500 text-white p-0.5" /> Pros</p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {product.pros.length ? product.pros.map((p,i) => <li key={i} className="flex gap-1.5"><Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" /> <span>{p}</span></li>) : <li className="text-muted-foreground">—</li>}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700"><X className="h-3.5 w-3.5 rounded-full bg-red-500 text-white p-0.5" /> Cons</p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {product.cons.length ? product.cons.map((c,i) => <li key={i} className="flex gap-1.5"><X className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" /> <span>{c}</span></li>) : <li className="text-muted-foreground">—</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* User Reviews */}
          {showReviews && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /> User Reviews</h3>
                <span className="text-sm font-bold">{product.rating ?? '—'} / 5 <span className="text-xs font-normal text-muted-foreground">({product.ratingCountText ?? ''})</span></span>
              </div>
              <div className="mt-3 space-y-1.5">
                {[5,4,3,2,1].map((s) => {
                  const widths: Record<number,string> = {5:'w-[72%]',4:'w-[18%]',3:'w-[6%]',2:'w-[2%]',1:'w-[2%]'};
                  const pct = s===5?72: s===4?18: s===3?6:2;
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="w-6">{s} ★</span>
                      <div className="h-2 flex-1 rounded-full bg-muted"><div className={`h-2 rounded-full bg-blue-600 ${widths[s]}`} /></div>
                      <span className="w-8 text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <button className="mt-3 w-full rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30">Read All Reviews</button>
            </div>
          )}

          {/* Read Also */}
          {readAlsoArticles.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4 text-primary" /> Read Also</h3>
              <div className="mt-3 space-y-2">
                {readAlsoArticles.map((a) => {
                  const href = a.mainCategory ? `/${a.mainCategory.slug}/${a.slug}` : '#';
                  return (
                    <Link
                      key={a.id}
                      href={href}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:border-foreground/20"
                    >
                      <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{a.title}</span>
                      {a.mainCategory && (
                        <span className="ml-auto flex-shrink-0 text-xs text-muted-foreground">{a.mainCategory.displayName}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
