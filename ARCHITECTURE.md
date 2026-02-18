# ARCHITECTURE.md — Mod Hub Technical Blueprint

## Stack Overview

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Server-side rendering for SEO. Every build page must be crawlable by Google. |
| Database | Supabase (PostgreSQL) | Handles DB, auth, file storage, and row-level security in one service. Free tier to start. |
| Hosting | Vercel | Made by Next.js creators. Auto-deploys from GitHub. Zero server management. |
| Styling | Tailwind CSS | Utility-first CSS. Claude Code builds UI fast with it. No custom CSS files to manage. |
| Image Storage | Supabase Storage | Build photos, profile pics, mod images. Serves via CDN. |
| Domain | modhub.app | DNS managed on GoDaddy. Point to Vercel. |

## Folder Structure

```
modhub/
├── CLAUDE.md                    # Rules for Claude Code
├── ARCHITECTURE.md              # This file
├── BUILD_PLAN.md                # Phased build checklist
├── CHANGELOG.md                 # What changed and when
├── PRD.md                       # Product requirements (from MVP doc)
├── .env.local                   # Local environment variables (never commit)
├── .env.example                 # Template for env vars
├── next.config.js
├── tailwind.config.js
├── package.json
├── public/
│   └── images/                  # Static assets (logo, placeholder images)
├── app/                         # Next.js App Router (all pages)
│   ├── layout.js                # Root layout (nav, footer, fonts)
│   ├── page.js                  # Homepage
│   ├── builds/
│   │   └── [slug]/
│   │       └── page.js          # Individual build page (SSR — most important page)
│   ├── explore/
│   │   └── page.js              # Browse all builds
│   ├── mods/
│   │   └── [id]/
│   │       └── page.js          # Individual mod detail page
│   ├── shop/
│   │   └── page.js              # Shop Mods browse page
│   ├── profile/
│   │   └── [username]/
│   │       └── page.js          # Public profile page
│   ├── my-builds/
│   │   └── page.js              # User's builds (authenticated)
│   ├── create/
│   │   └── page.js              # Create/edit build flow
│   ├── settings/
│   │   └── page.js              # Profile settings
│   ├── admin/
│   │   ├── page.js              # Admin dashboard
│   │   ├── users/page.js        # User management
│   │   └── match/page.js        # Auto-match dashboard
│   ├── auth/
│   │   ├── login/page.js
│   │   ├── signup/page.js
│   │   └── callback/page.js     # Supabase auth callback
│   ├── api/
│   │   └── sitemap/route.js     # Dynamic sitemap generation
│   └── sitemap.xml/
│       └── route.js             # Sitemap for Google
├── components/
│   ├── layout/
│   │   ├── Sidebar.js           # Left nav sidebar
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── builds/
│   │   ├── BuildCard.js         # Build card for explore grid
│   │   ├── BuildGallery.js      # Photo gallery on build page
│   │   ├── ModList.js           # List of mods on build page
│   │   └── ModCard.js           # Individual mod entry
│   ├── mods/
│   │   ├── ModDetail.js         # Full mod detail view
│   │   ├── ConsensusScore.js    # Enthusiast consensus display
│   │   └── ShopButton.js        # "Shop This Part" button with tracking
│   ├── forms/
│   │   ├── BuildForm.js         # Create/edit build form
│   │   ├── ModForm.js           # Add mod to build
│   │   └── ProfileForm.js       # Edit profile
│   ├── search/
│   │   ├── SearchBar.js
│   │   └── VehicleFilter.js     # Make/model/chassis filter chips
│   └── ui/
│       ├── Button.js
│       ├── Modal.js
│       ├── ImageUpload.js
│       └── ProgressBar.js       # Build completion indicator
├── lib/
│   ├── supabase/
│   │   ├── client.js            # Browser Supabase client
│   │   ├── server.js            # Server-side Supabase client (for SSR)
│   │   └── admin.js             # Service role client (for admin operations)
│   ├── queries/
│   │   ├── builds.js            # All build-related database queries
│   │   ├── mods.js              # All mod-related queries
│   │   ├── users.js             # User queries
│   │   ├── vehicles.js          # YMM data queries
│   │   └── match.js             # Auto-match logic
│   ├── utils/
│   │   ├── seo.js               # Meta tag generation, schema markup
│   │   ├── slugify.js           # URL slug generation
│   │   ├── match-engine.js      # Shopify catalog string matching
│   │   └── utm.js               # UTM parameter generation for shop links
│   └── constants/
│       ├── categories.js        # Mod categories (Engine, Exterior, Interior, etc.)
│       └── vehicles.js          # Top 50 vehicle data (make/model/chassis)
└── supabase/
    └── migrations/              # Database migration files
        └── 001_initial.sql
```

## Database Schema (Supabase / PostgreSQL)

### profiles
```sql
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
```

### vehicles
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  chassis_code TEXT,           -- E36, E46, G80, GR86, etc.
  generation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seed with top 50 enthusiast vehicles matching Mod Supply catalog
```

### builds
```sql
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  title TEXT NOT NULL,          -- "2026 BMW M3"
  slug TEXT UNIQUE NOT NULL,    -- "2026-bmw-m3-g80-max" (for URL)
  year INTEGER,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  chassis_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',  -- draft | published
  specs JSONB DEFAULT '{}',     -- { engine: "S55", horsepower: "473", ... }
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
```

### build_photos
```sql
CREATE TABLE build_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,   -- ordering
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### mods
```sql
CREATE TABLE mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,            -- "Mishimoto Skid Plate"
  brand TEXT,                    -- "Mishimoto"
  category TEXT NOT NULL,        -- "Engine & Performance", "Exterior / Aero", etc.
  url TEXT,                      -- Original product URL
  image_url TEXT,
  install_status TEXT DEFAULT 'installed',  -- installed | planned | removed
  would_install_again BOOLEAN,
  install_notes TEXT,
  
  -- Auto-match fields
  matched_shopify_handle TEXT,   -- If matched to Mod Supply catalog
  match_confidence FLOAT,        -- 0-1 similarity score
  match_status TEXT DEFAULT 'pending', -- pending | matched | unmatched | manual
  shop_url TEXT,                 -- Final shop link (modsupply.com or affiliate)
  
  -- Consensus (aggregated, updated periodically)
  consensus_score FLOAT,
  consensus_confidence TEXT,     -- "Low", "Medium", "High"
  consensus_summary TEXT,        -- AI-generated summary
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
```

### catalog (Mod Supply Shopify products)
```sql
CREATE TABLE catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  vendor TEXT,                   -- Brand name
  sku TEXT,
  product_type TEXT,
  image_url TEXT,
  price DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_catalog_vendor ON catalog(vendor);
CREATE INDEX idx_catalog_title_trgm ON catalog USING gin(title gin_trgm_ops);
-- Enable trigram extension for fuzzy matching:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### saved_builds
```sql
CREATE TABLE saved_builds (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, build_id)
);
```

### comments (Phase 2)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),  -- For threading
  type TEXT DEFAULT 'comment',  -- 'comment' | 'question' | 'answer'
  body TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## URL Structure (Critical for SEO)

```
modhub.app/                                          → Homepage
modhub.app/explore                                   → Browse all builds
modhub.app/builds/2026-bmw-m3-g80-max               → Individual build page
modhub.app/mods/mishimoto-skid-plate-g80             → Mod detail page
modhub.app/shop                                      → Shop mods catalog
modhub.app/profile/max                               → Public profile
modhub.app/my-builds                                 → Your builds (auth)
modhub.app/create                                    → Create build (auth)
modhub.app/settings                                  → Profile settings (auth)
modhub.app/admin                                     → Admin dashboard (admin only)
```

**Slug format for builds:** `[year]-[make]-[model]-[chassis]-[username]`
Example: `2026-bmw-m3-g80-max`

## SEO Architecture

Every build page MUST include:

### Meta Tags
```html
<title>2026 BMW M3 G80 Build | 8 Mods | Mod Hub</title>
<meta name="description" content="See the 8 mods on this 2026 BMW M3 G80. Engine & Performance, Exterior / Aero. Real owner build with photos and shop links." />
```

### Open Graph
```html
<meta property="og:title" content="2026 BMW M3 G80 Build | 8 Mods | Mod Hub" />
<meta property="og:description" content="See the 8 mods on this 2026 BMW M3 G80..." />
<meta property="og:image" content="[primary build photo URL]" />
<meta property="og:url" content="https://modhub.app/builds/2026-bmw-m3-g80-max" />
```

### JSON-LD Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "2026 BMW M3 G80 Build",
  "author": { "@type": "Person", "name": "Max Karpanty" },
  "datePublished": "2026-02-17",
  "image": "[primary photo]",
  "about": {
    "@type": "Vehicle",
    "name": "2026 BMW M3",
    "manufacturer": "BMW",
    "model": "M3",
    "vehicleModelDate": "2026"
  }
}
```

### Sitemap
Dynamic sitemap at `modhub.app/sitemap.xml` that auto-includes all published builds.

## Auto-Match System (P0 — Monetization Engine)

### How It Works
1. User adds a mod with a name and brand (e.g., "Mishimoto Skid Plate", brand: "Mishimoto")
2. System searches the `catalog` table using pg_trgm fuzzy matching
3. If match confidence > 0.6 (adjustable): link Shop button to `modsupply.com/products/[handle]?utm_source=modhub&utm_medium=build&utm_campaign=[build_slug]`
4. If no match: link to original product URL (with affiliate tag if available)
5. Admin dashboard shows match rate, top unmatched products, manual override

### Match Query
```sql
SELECT handle, title, vendor,
       similarity(title, $1) AS score
FROM catalog
WHERE vendor ILIKE $2          -- Brand must match
  AND similarity(title, $1) > 0.6
ORDER BY score DESC
LIMIT 1;
```

### Catalog Refresh
- Weekly CSV export from Shopify → parse → upsert into catalog table
- Can be manual initially. Automate with Shopify API later.

## Authentication
- Supabase Auth with email/password (primary)
- Google OAuth (nice to have, Phase 2)
- Auth state managed via Supabase client library
- Protected routes: /my-builds, /create, /settings, /admin
- Admin routes: check profiles.is_admin

## Image Handling
- Upload to Supabase Storage bucket: `build-photos`
- Resize on upload (max 1200px wide) using Next.js Image optimization
- Serve via Supabase CDN URL
- Build photos: up to 10 per build
- Profile photos: 1 avatar, 1 header

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
NEXT_PUBLIC_SITE_URL=https://modhub.app
```

## Key Principles
1. **Server-render everything public.** Build pages, explore, shop, profiles — all SSR.
2. **Client-side only for interactions.** Like/save/comment actions, form submissions, image uploads.
3. **Keep the database simple.** No complex joins. Denormalize where it speeds up queries (mod_count on builds, etc.).
4. **UTM everything.** Every shop link includes UTM params so you can track Mod Hub → Mod Supply conversion in GA/Shopify.
5. **Mobile-first design.** Most car enthusiasts browse on phones. Every page must look great on mobile.
