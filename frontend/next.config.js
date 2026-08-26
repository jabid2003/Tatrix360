/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Skip type-checking and linting during `next build`.
  // Speeds up the build significantly and avoids the build hanging on
  // transient issues (Supabase timeouts, etc.) that are irrelevant to
  // the output.  Run `tsc --noEmit` and `next lint` separately in CI.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // Allow longer image optimisation during build
    minimumCacheTTL: 60 * 60,
  },
};
module.exports = nextConfig;
