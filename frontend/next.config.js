/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable source maps in production for debugging
  productionBrowserSourceMaps: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: '*.pexels.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },

  // ─── SECURITY HEADERS ───
  // Applied to every response via Next.js built-in headers() config.
  // These replace the need for middleware header injection.
  //
  // TODO: When adding Google Analytics, add 'www.googletagmanager.com' and
  //       'www.google-analytics.com' to script-src and connect-src.
  // TODO: When adding Google AdSense, add 'pagead2.googlesyndication.com' to
  //       script-src, and 'googleads.g.doubleclick.net' to connect-src.
  // TODO: When adding other ad networks, extend script-src, connect-src, and
  //       frame-src accordingly.
  headers: async () => [
    {
      // Apply security headers to all routes
      source: '/(.*)',
      headers: [
        // ── Referrer-Policy ──
        // Sends full URL on same-origin, origin-only on cross-origin.
        // Protects user privacy while allowing analytics to see referral sources.
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },

        // ── X-Content-Type-Options ──
        // Prevents browsers from MIME-sniffing responses away from declared
        // content type. Stops drive-by downloads via malicious file uploads.
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },

        // ── X-Frame-Options ──
        // Prevents clickjacking by refusing to frame this site in iframes.
        // Kept alongside CSP frame-ancestors for older browser support.
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },

        // ── X-XSS-Protection ──
        // Legacy XSS filter. Modern browsers ignore this, but it helps
        // older IE/Edge versions. Enabled as a defense-in-depth measure.
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },

        // ── Strict-Transport-Security (HSTS) ──
        // Forces HTTPS for 2 years, includes subdomains, and submits to
        // the HSTS preload list. Prevents protocol downgrade attacks.
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },

        // ── Permissions-Policy ──
        // Restricts browser features. Denies camera, microphone, geolocation,
        // and payment by default. Adjust if adding payment or maps later.
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=()',
        },

        // ── Content-Security-Policy ──
        // Comprehensive CSP for a news site with Cloudinary images.
        //
        // Directives explained:
        //   default-src 'self'          — Allow same-origin by default
        //   script-src 'self'           — Only self-hosted scripts (Next.js bundles)
        //   style-src 'self' 'unsafe-inline' — Self-hosted + inline (Tailwind runtime)
        //   img-src 'self' data: blob: res.cloudinary.com images.unsplash.com
        //                              — Self, data URIs (blur placeholders), Cloudinary, Unsplash
        //   font-src 'self'             — Self-hosted fonts only
        //   connect-src 'self'          — API calls to same origin (Supabase via API routes)
        //   media-src 'self'            — Self-hosted media
        //   object-src 'none'           — Block Flash/plugins entirely
        //   base-uri 'self'             — Prevent base tag injection
        //   form-action 'self'          — Forms submit only to same origin
        //   frame-ancestors 'none'      — Prevent framing (replaces X-Frame-Options)
        //   upgrade-insecure-requests   — Auto-upgrade HTTP to HTTPS
        //
        // TODO: When adding Google Analytics/Tag Manager:
        //   script-src: Add 'www.googletagmanager.com' 'www.google-analytics.com'
        //   connect-src: Add 'www.google-analytics.com' 'analytics.google.com'
        //
        // TODO: When adding Google AdSense:
        //   script-src: Add 'pagead2.googlesyndication.com'
        //   connect-src: Add 'googleads.g.doubleclick.net' 'pagead2.googlesyndication.com'
        //   frame-src: Add 'googleads.g.doubleclick.net'
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: res.cloudinary.com images.unsplash.com images.pexels.com *.pexels.com",
            "font-src 'self'",
            "connect-src 'self'",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
          ].join('; '),
        },
      ],
    },
  ],
};

module.exports = nextConfig;
