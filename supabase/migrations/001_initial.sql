-- ============================================================
-- Mod Hub — Initial Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable fuzzy text matching (needed for auto-match engine)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- PROFILES
-- One profile per user. Created automatically on signup.
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  header_url TEXT,
  instagram TEXT,
  website TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- The YMM (Year/Make/Model) catalog. Seeded with top 50 enthusiast vehicles.
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  chassis_code TEXT,
  generation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUILDS
-- A user's documented car build.
-- ============================================================
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  year INTEGER,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  chassis_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  specs JSONB DEFAULT '{}',
  completion_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  mod_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_builds_slug ON builds(slug);
CREATE INDEX idx_builds_status ON builds(status);
CREATE INDEX idx_builds_chassis ON builds(chassis_code);
CREATE INDEX idx_builds_make_model ON builds(make, model);

-- ============================================================
-- BUILD PHOTOS
-- Up to 10 photos per build. One marked as primary.
-- ============================================================
CREATE TABLE build_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODS
-- Individual modifications on a build. Core of the product.
-- ============================================================
CREATE TABLE mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  url TEXT,
  image_url TEXT,
  install_status TEXT DEFAULT 'installed',
  would_install_again BOOLEAN,
  install_notes TEXT,

  -- Auto-match fields (links mod to Mod Supply catalog)
  matched_shopify_handle TEXT,
  match_confidence FLOAT,
  match_status TEXT DEFAULT 'pending',
  shop_url TEXT,

  -- Enthusiast consensus (aggregated ratings across all installs)
  consensus_score FLOAT,
  consensus_confidence TEXT,
  consensus_summary TEXT,
  consensus_pros TEXT[],
  consensus_cons TEXT[],

  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mods_build ON mods(build_id);
CREATE INDEX idx_mods_brand ON mods(brand);
CREATE INDEX idx_mods_category ON mods(category);
CREATE INDEX idx_mods_match_status ON mods(match_status);

-- ============================================================
-- CATALOG
-- Mod Supply's Shopify product catalog. Used for auto-matching.
-- ============================================================
CREATE TABLE catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  vendor TEXT,
  sku TEXT,
  product_type TEXT,
  image_url TEXT,
  price DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalog_vendor ON catalog(vendor);
CREATE INDEX idx_catalog_title_trgm ON catalog USING gin(title gin_trgm_ops);

-- ============================================================
-- SAVED BUILDS
-- Users can bookmark builds they like.
-- ============================================================
CREATE TABLE saved_builds (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, build_id)
);

-- ============================================================
-- COMMENTS (Phase 2)
-- Threaded comments on builds.
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),
  type TEXT DEFAULT 'comment',
  body TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Controls who can read/write what. Critical for data safety.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mods ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Builds: published builds are public; drafts only visible to owner
CREATE POLICY "Published builds are publicly readable" ON builds FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can insert own builds" ON builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON builds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own builds" ON builds FOR DELETE USING (auth.uid() = user_id);

-- Build photos: readable if the build is readable
CREATE POLICY "Build photos follow build visibility" ON build_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM builds WHERE builds.id = build_photos.build_id
    AND (builds.status = 'published' OR builds.user_id = auth.uid())
  ));
CREATE POLICY "Users can manage own build photos" ON build_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = build_photos.build_id AND builds.user_id = auth.uid()));

-- Mods: same visibility as their build
CREATE POLICY "Mods follow build visibility" ON mods FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM builds WHERE builds.id = mods.build_id
    AND (builds.status = 'published' OR builds.user_id = auth.uid())
  ));
CREATE POLICY "Users can manage own mods" ON mods FOR ALL
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = mods.build_id AND builds.user_id = auth.uid()));

-- Catalog: publicly readable, only service role can write
CREATE POLICY "Catalog is publicly readable" ON catalog FOR SELECT USING (true);

-- Saved builds: users manage their own saves
CREATE POLICY "Users can manage own saved builds" ON saved_builds FOR ALL USING (auth.uid() = user_id);

-- Comments: public read, auth write
CREATE POLICY "Comments on published builds are readable" ON comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = comments.build_id AND builds.status = 'published'));
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Trigger that fires when a new user registers.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
