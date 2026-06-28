-- Run this once in your Supabase SQL Editor (dashboard → SQL Editor → New query)
-- This creates the table that stores all visual editor content.

CREATE TABLE IF NOT EXISTS site_content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update timestamp on every write
CREATE OR REPLACE FUNCTION update_site_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_content_updated ON site_content;
CREATE TRIGGER trg_site_content_updated
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_site_content_timestamp();

-- Row-level security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read content (needed for SSR/public visitors)
CREATE POLICY "Public read site_content"
  ON site_content FOR SELECT
  USING (true);

-- Only authenticated users can write (your admin accounts)
CREATE POLICY "Auth write site_content"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
