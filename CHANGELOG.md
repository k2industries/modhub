# CHANGELOG.md — Mod Hub Development Log

## Format
Each entry: Date, what was built, files changed, notes.

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
✅ Pushed to GitHub
