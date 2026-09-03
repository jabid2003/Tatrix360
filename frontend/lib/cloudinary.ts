import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Sanitize a blog title into a clean, URL-safe slug for use as Cloudinary public_id.
 * Example: "Top 10 AI Tools in 2026!" → "top-10-ai-tools-in-2026"
 */
export function sanitizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 200); // Cloudinary public_id max length
}