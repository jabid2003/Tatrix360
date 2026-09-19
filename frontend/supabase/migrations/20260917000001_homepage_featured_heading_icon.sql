-- Add heading_icon column to homepage_featured for per-heading icon
ALTER TABLE homepage_featured ADD COLUMN IF NOT EXISTS heading_icon TEXT;
