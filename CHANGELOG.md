# CHANGELOG.md — Mod Hub Development Log

## Format
Each entry: Date, what was built, files changed, notes.

---

## 2026-02-19 — Pre-Phase-1C: UI/UX Polish

### What was built
- **DB migration** (`005_discount_codes.sql`) — adds `discount_code TEXT` + `discount_pct INTEGER` to mods table
- **Sidebar redesign** — inline SVG icons on all nav items, user avatar + username moved to top when logged in, new nav items: Search Cars (→/explore), Saved (→/saved), Settings (→/settings)
- **Homepage dark hero** — full-bleed charcoal gradient, centered search bar (links to /explore?q=...) with `SearchBar` client component, CTAs kept
- **BuildGallery counter** — "{n} / {total}" overlay at bottom-right of main photo
- **ModCard** — entire card clickable via stretched-link pattern (`before:absolute before:inset-0`), discount code badge (green), Shop `<a>` uses `z-10` to float above card link
- **ModList** — accepts `isOwner` + `buildSlug` props (passed through to ModCard)
- **Build detail page** — fetches current user SSR, computes `isOwner`, shows Edit Build + Share buttons for owners, Share button is a `ShareButton` client component (copies URL to clipboard)
- **Mod detail page** (`/mods/[id]`) — new SSR page with breadcrumb, hero (product image + info), Shop button, Creator's Take, Enthusiast Consensus (ConsensusScore), Evidence Used (expandable), YouTube placeholder grid
- **ConsensusScore** (`components/mods/ConsensusScore.js`) — stars, confidence badge, pros/cons, empty state
- **ShopButton** (`components/mods/ShopButton.js`) — full-width red button
- **ShareButton** (`components/builds/ShareButton.js`) — copies build URL to clipboard
- **Multi-step BuildForm wizard** — 4-step stepper (Car → Photos → Mods → Publish), step indicator with colored circles, Next/Back navigation, publish summary on step 4
- **ModForm** — discount code + discount % fields added

### Files changed
- Created: `supabase/migrations/005_discount_codes.sql`
- Created: `app/mods/[id]/page.js`
- Created: `components/mods/ConsensusScore.js`
- Created: `components/mods/ShopButton.js`
- Created: `components/builds/ShareButton.js`
- Created: `components/search/SearchBar.js`
- Modified: `components/layout/Sidebar.js`
- Modified: `app/page.js`
- Modified: `app/builds/[slug]/page.js`
- Modified: `components/builds/BuildGallery.js`
- Modified: `components/builds/ModCard.js`
- Modified: `components/builds/ModList.js`
- Modified: `lib/queries/mods.js`
- Modified: `components/forms/BuildForm.js`
- Modified: `components/forms/ModForm.js`

---

## 2026-02-19 — Phase 1A: Build Pages

### What was built
- **Build detail page** (`/builds/[slug]`) — SSR, photo gallery, mods grouped by category, specs sidebar, builder profile, share section, full SEO (meta, OG, JSON-LD schema)
- **Explore page** (`/explore`) — build grid, chassis filter chips, search, sort (newest/most mods/most viewed), pagination
- **Homepage** — updated with featured builds grid pulling live data from Supabase
- **Components:** `BuildCard`, `BuildGallery` (client, clickable thumbnails), `ModCard` (with red Shop button), `ModList` (grouped by category)
- **Query layer:** `lib/queries/builds.js`, `lib/queries/mods.js`
- **Constants:** `lib/constants/categories.js` (9 categories + colors), `lib/constants/vehicles.js` (42 vehicles + explore filters)
- **Utils:** `lib/utils/slugify.js`
- **Trigger fix:** `002_fix_user_trigger.sql` — handles edge cases, never blocks signup
- **Seed data:** `003_seed_test_build.sql` — BMW M3 G80 with 8 mods and 3 photos

### Status
✅ Build detail page live and verified at /builds/2023-bmw-m3-g80-max
✅ Explore page with filters and pagination working
✅ Homepage showing featured builds from database
✅ All pages server-rendered (SSR) — Google can crawl every build page
✅ Pushed to GitHub → auto-deployed to Vercel

---

## 2026-02-17 — Phase 0: Project Setup

### What was built
- Scaffolded Next.js 14 project (App Router, JavaScript, Tailwind CSS)
- Configured Tailwind with Mod Hub color scheme (`#DC2626` red, white background)
- Created full folder structure per ARCHITECTURE.md
- Built root layout (`app/layout.js`) with sidebar nav
- Built `Sidebar.js` component — left nav with red active state, Log In / Sign Up buttons
- Built placeholder homepage (`app/page.js`)
- Created all three Supabase clients: browser, server, admin
- Created `.env.local` with Supabase credentials (not committed to git)
- Created `.env.example` as a template for future contributors
- Ran database migration `001_initial.sql` — all 7 tables created in Supabase:
  `profiles`, `vehicles`, `builds`, `build_photos`, `mods`, `catalog`, `saved_builds`, `comments`
- Enabled `pg_trgm` extension for fuzzy auto-matching
- Set up Row Level Security (RLS) policies on all tables
- Created auto-profile trigger (creates a profile row on every new signup)
- Initialized git repo, created GitHub repo (`k2industries/modhub`), pushed first commit

### Files created
`package.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`,
`.eslintrc.json`, `.gitignore`, `.env.example`, `app/globals.css`, `app/layout.js`,
`app/page.js`, `components/layout/Sidebar.js`, `lib/supabase/client.js`,
`lib/supabase/server.js`, `lib/supabase/admin.js`, `supabase/migrations/001_initial.sql`

### Status
✅ Site runs locally at http://localhost:3000
✅ Supabase connected and verified
✅ All database tables created
✅ Supabase Storage bucket `build-photos` created
✅ Pushed to GitHub
✅ Deployed to Vercel — https://modhub-git-main-max-karpantys-projects.vercel.app
⏳ modhub.app DNS — pending (GoDaddy → Vercel, to be done later)
