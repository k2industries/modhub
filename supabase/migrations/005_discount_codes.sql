-- Add discount code support to mods table
ALTER TABLE mods
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_pct INTEGER;
