# BUILD_PLAN.md — Mod Hub Phased Build Checklist

## Overview
Building Mod Hub in phases. Each phase produces something testable. Phase 1 is the minimum needed to launch. Later phases add features. SEO and the auto-match system are Phase 1 because they ARE the business.

Estimated effort: ~5 hours/week, targeting launch in 4-6 weeks.

---

## Phase 0: Project Setup (Week 1, Session 1)
Get the project scaffolded and running locally.

- [x] Initialize Next.js 14 project with App Router
- [x] Install dependencies: Tailwind CSS, Supabase client, etc.
- [x] Set up Tailwind config with Mod Hub color scheme (red/dark theme from MVP)
- [x] Create Supabase project (database, auth, storage)
- [x] Run database migrations (all tables from ARCHITECTURE.md)
- [x] Enable pg_trgm extension for fuzzy matching
- [x] Create Supabase Storage bucket for build photos
- [x] Set up environment variables (.env.local)
- [x] Create root layout with sidebar navigation (matching MVP design)
- [x] Set up GitHub repo
- [x] Connect to Vercel for auto-deploy
- [ ] Verify modhub.app DNS points to Vercel
- [ ] Confirm site loads at modhub.app with basic layout

**Done when:** Site loads at modhub.app with the sidebar nav and a placeholder homepage.

---

## Phase 1A: Build Pages — The Core (Week 1-2, Sessions 2-4)
The most important pages. This is the product.

### Build Detail Page (SSR — #1 Priority)
- [x] Create build detail page at /builds/[slug]
- [x] Server-side render all build data (title, YMM, chassis, photos, mods)
- [x] Photo gallery with thumbnails (matching MVP layout)
- [x] Mods list grouped by category (Engine & Performance, Exterior / Aero, etc.)
- [x] Each mod shows: name, brand, image, install status, "Shop" button
- [x] Specs tab (engine, horsepower, etc. from JSONB field)
- [x] Builder profile section (avatar, name, Instagram, website)
- [x] Share button
- [x] SEO: meta title, meta description, OG tags, JSON-LD schema
- [x] SEO: clean URL format /builds/[year]-[make]-[model]-[chassis]-[username]
- [x] Mobile responsive layout

### Explore Builds Page
- [x] Grid of BuildCards showing all published builds
- [x] Each card: primary photo, title (year make model), chassis code, mod count, builder name
- [x] Top Models filter chips (BMW E36, E46, F8X, Toyota GR86, Nissan 350Z, etc.)
- [x] Search bar (search by car, model, or builder)
- [x] Sort by: Newest, Most Mods, Most Viewed
- [x] Pagination or infinite scroll

### Homepage
- [x] Hero section with search bar and "Share Your Build" CTA
- [x] Value props: Browse Real Builds, See Enthusiast Consensus, Shop With Confidence
- [x] Featured builds grid (latest published)

**Done when:** You can visit modhub.app, browse builds, click into a build page, and see all mods with shop links. Google can crawl and index every build page.

---

## Phase 1B: Auth + Build Creation (Week 2-3, Sessions 4-6)
Let users create accounts and builds.

### Authentication
- [ ] Sign up page (email + password)
- [ ] Login page
- [ ] Auth callback handler
- [ ] Auto-create profile on signup
- [ ] Protected route middleware (redirect to login if not authenticated)
- [ ] Session management (stay logged in)

### Create / Edit Build
- [ ] Create build form: Year, Make, Model, Chassis Code (dropdown/search from vehicles table)
- [ ] Build title auto-generated from YMM
- [ ] Photo upload (drag & drop or click, up to 10 photos)
- [ ] Set primary photo
- [ ] Add description
- [ ] Add specs (key-value pairs)
- [ ] Save as Draft / Publish toggle
- [ ] Edit existing build
- [ ] Auto-generate slug on first publish

### Add Mods to Build
- [ ] "Add Mod" button on build edit page
- [ ] Mod form: Name, Brand, Category (dropdown), URL, Image URL
- [ ] Install status: Installed / Planned / Removed
- [ ] "Would install again" toggle
- [ ] Install notes text field
- [ ] Reorder mods within categories
- [ ] Delete mod

### My Builds Page
- [ ] List of user's builds (Published tab, Drafts tab)
- [ ] Build card with thumbnail, title, mod count
- [ ] "Add Car" button

**Done when:** A new user can sign up, create a build with photos and mods, publish it, and it appears on Explore and has a working SEO-optimized URL.

---

## Phase 1C: Auto-Match + Shop (Week 3-4, Sessions 6-8)
The monetization engine.

### Catalog Import
- [ ] Create script to parse Shopify product CSV → insert into catalog table
- [ ] Fields: shopify_handle, title, vendor, sku, product_type, image_url, price
- [ ] Import Mod Supply catalog (~140K products)

### Auto-Match Engine
- [ ] On mod save: run match query against catalog (brand + title fuzzy match)
- [ ] If match > 0.6 confidence: set shop_url to modsupply.com/products/[handle] with UTM params
- [ ] If no match: use original URL (or blank)
- [ ] Store match_confidence and match_status on mod record
- [ ] "Shop" button on mod cards links to shop_url
- [ ] UTM params: utm_source=modhub, utm_medium=build, utm_campaign=[build_slug]

### Shop Mods Page
- [ ] Browse all mods that have been added across all builds
- [ ] Filter by category
- [ ] Filter by vehicle (show mods for specific chassis)
- [ ] Sort: Most Installed, Highest Rated, Newest
- [ ] Each mod shows: image, name, brand, install count, shop link

### Mod Detail Page
- [ ] Full page for individual mod
- [ ] Product image, name, brand
- [ ] "Shop This Part" button
- [ ] "Used on X builds" with links
- [ ] Creator's take (would install again + notes)
- [ ] Enthusiast Consensus section (score, confidence, pros, cons)
- [ ] Related YouTube videos (nice to have — can defer)

### Admin: Match Dashboard
- [ ] Match rate % (matched / total mods)
- [ ] Top unmatched products (sorted by frequency)
- [ ] Manual match override (admin can link a mod to a catalog product)
- [ ] Catalog stats: total products, last refresh date

**Done when:** When someone adds a mod, it automatically tries to match to a Mod Supply product. Shop buttons link to modsupply.com with tracking. Admin can see match rate and fix mismatches.

---

## Phase 1D: SEO + Sitemap + Launch Prep (Week 4, Sessions 8-9)
Final SEO hardening and launch readiness.

### SEO
- [ ] Dynamic sitemap.xml that includes all published builds
- [ ] Submit sitemap to Google Search Console
- [ ] Verify all build pages have correct meta tags (spot check 5-10)
- [ ] Verify OG tags work (test with Facebook debugger, Twitter card validator)
- [ ] Verify JSON-LD schema (test with Google Rich Results Test)
- [ ] Robots.txt (allow all public pages)
- [ ] Canonical URLs on all pages

### Profile Pages
- [ ] Public profile at /profile/[username]
- [ ] Avatar, display name, bio, Instagram, website
- [ ] Grid of user's published builds
- [ ] Profile settings page (edit all fields)

### Polish
- [ ] 404 page
- [ ] Loading states on all pages
- [ ] Error handling (graceful failures)
- [ ] Image optimization (next/image for all photos)
- [ ] Favicon and app icons
- [ ] Mobile responsive check on all pages

**Done when:** Site is ready for real users. SEO is verified. All core flows work on mobile. Google Search Console shows pages being indexed.

---

## Phase 2: Engagement Features (Post-Launch)
Build after April launch based on user feedback.

- [ ] Comments on builds (threaded, 1 level deep)
- [ ] Q&A tab on builds (questions + answers, "Best Answer" marking)
- [ ] Follow users + notifications
- [ ] Save/bookmark builds
- [ ] Build completion indicator (progress bar)
- [ ] Related/Similar Builds on build pages
- [ ] Content moderation (flag/report)
- [ ] Email notifications (new comment, new follower)

---

## Phase 3: Growth Features (Month 2-3)
- [ ] Post-purchase flow: Mod Supply order → prompt to create Mod Hub build
- [ ] "Best Mods for [Chassis]" auto-generated SEO pages
- [ ] Builder affiliate program (store credit for purchases via their build)
- [ ] Brand pages (all builds using a brand's products)
- [ ] Google OAuth login
- [ ] Mod Hub Pro subscription ($9/mo)
- [ ] Analytics dashboard for builders

---

## Session Workflow

Each coding session (roughly 1-2 hours):

1. Open Claude Code in the modhub project folder
2. Claude reads CLAUDE.md automatically
3. Tell Claude: "Read ARCHITECTURE.md and BUILD_PLAN.md. We're working on [specific items]."
4. Claude asks clarifying questions if needed
5. Build the items
6. Test locally
7. When working, commit to GitHub (auto-deploys to Vercel)
8. Update CHANGELOG.md with what was done
9. Check off items in this file

---

## Notes
- Don't skip Phase 1C (auto-match). Without it, Mod Hub generates content but no revenue.
- SEO is verified BEFORE launch. Don't launch until Google can see build pages.
- Seed 50+ builds before going public (Max creates from personal cars + friends).
- The Base44 MVP screenshots are the design reference. Match that look and feel.
