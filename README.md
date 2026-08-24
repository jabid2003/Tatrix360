# Tatrix360 — Tech, decoded. 🔥

> **A modern tech news magazine** — sharp reporting on AI, gadgets, mobiles, and the platforms shaping our digital lives.
> Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase + Cloudinary**.

| | |
|---|---|
| 🌐 **Live Website** | https://tatrix360.vercel.app/ |
| 📦 **Source Code** | https://github.com/jabid2003/Tatrix360 |
| 🗄️ **Database** | Supabase (PostgreSQL) — replaces the old Strapi CMS |
| 🖼️ **Media Hosting** | Cloudinary |
| 🚀 **Deployment** | Vercel (primary) / Netlify (config included) |
| 📝 **Status** | Production-hardened, actively maintained |

---

## Table of Contents

1. [What is Tatrix360?](#1-what-is-tatrix360)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Repository Structure](#4-repository-structure)
5. [Database Schema (Supabase)](#5-database-schema-supabase)
6. [Features](#6-features)
7. [Routing Map](#7-routing-map)
8. [Data Layer API](#8-data-layer-api)
9. [Authentication & Security](#9-authentication--security)
10. [Environment Variables](#10-environment-variables)
11. [Local Development Setup](#11-local-development-setup)
12. [Deployment Guide](#12-deployment-guide)
13. [Design System](#13-design-system)
14. [Code Conventions & Patterns](#14-code-conventions--patterns)
15. [Known Quirks & Technical Decisions](#15-known-quirks--technical-decisions)
16. [Unused / Available Components](#16-unused--available-components)
17. [Common Modification Recipes](#17-common-modification-recipes)
18. [Ideas & Roadmap](#18-ideas--roadmap)
19. [License](#19-license)

---

## 1. What is Tatrix360?

Tatrix360 is a **content-driven tech news magazine website**. It lets editors publish articles (news, reviews, guides, and opinion pieces) organized into categories like **AI, Android, iOS, Gadgets, Deals, and How-To**. Readers can browse the homepage, read articles, search across all posts, subscribe to a newsletter, and contact the editorial team.

The project started as a **Next.js + Strapi CMS** stack and was later migrated to **Supabase** as the single data store (Strapi is no longer used for anything — see [§15](#15-known-quirks--technical-decisions)).

It is a **public content site with no user sign-up**. There is a single **password-protected admin panel** (no multi-user auth) where the site owner can create, edit, and delete articles, upload images, and manage SEO metadata.

### Core value proposition
- **Editorial CMS without the overhead** — a small, fast admin panel wired directly to a PostgreSQL database.
- **SEO-first** — per-article metadata, JSON-LD structured data, sitemap, RSS feed, canonical URLs, and Open Graph/Twitter cards.
- **Modern UX** — dark/light theme (dark by default), animated route transitions, skeleton loaders, keyboard search (`⌘K`), and a PWA-style "Install App" button.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Framework** | Next.js (App Router) | ^14.2.35 | React Server Components + Server Actions pattern |
| **Language** | TypeScript | ^5 | Strict-ish typing throughout |
| **UI Library** | React | ^18.3.1 | |
| **Styling** | Tailwind CSS | ^3.4.13 | Custom design tokens, `darkMode: 'class'` |
| **Component System** | shadcn/ui + Radix UI primitives | — | 47 components in `components/ui/` |
| **Database** | Supabase (PostgreSQL) | @supabase/supabase-js ^2.111.0 | Single-tenant, public RLS policies |
| **Image Hosting** | Cloudinary | ^2.10.1 | Admin image uploads (max 5 MB) |
| **Auth (Admin)** | Custom JWT via `jose` | ^6.2.10 | HS256 signed cookie, 7-day expiry |
| **Icons** | lucide-react | ^0.439.0 | |
| **Toasts** | sonner | ^2.0.7 | Mounted globally |
| **Theming** | next-themes | ^0.4.6 | Default dark, class strategy |
| **Fonts** | next/font/google | — | Inter, Playfair Display, JetBrains Mono |
| **Analytics** | @vercel/speed-insights | ^2.0.0 | Vercel Speed Insights |
| **Charts (available)** | recharts | ^3.10.0 | Installed, not currently used on pages |
| **Forms** | react-hook-form | ^7.83.0 | Installed (admin uses controlled state instead) |
| **Bundler/Dev** | Vite (legacy root) / Next build | — | Root `package.json` is a leftover, see [§15](#15-known-quirks--technical-decisions) |

> **Note:** The root `package.json` (`vite ^4.0.3`) is a leftover from an early prototype. **All real code lives in `/frontend`** and is built with Next.js.

---

## 3. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Reader / Admin)                    │
│   Dark/light UI · Next.js client components · Cmd+K search · PWA   │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTP (public pages)
┌───────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 14 APP (in /frontend)                   │
│                                                                     │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────────┐ │
│  │  Public      │  │  Admin Panel   │  │  API Routes             │ │
│  │  Pages       │  │  /admin/*      │  │  /api/admin/*           │ │
│  │  /, /ai/..., │  │  (JWT-protected)│  │  /api/search            │ │
│  │  /category/* │  └───────┬────────┘  │  /api/newsletter         │ │
│  │  /search ... │          │           │  /api/contact            │ │
│  └──────┬───────┘          │           │  /api/posts/[slug]/view  │ │
│         │                  │           └───────────┬─────────────┘ │
│  ┌──────▼──────────────────────────────────────────▼─────────────┐ │
│  │                    lib/data.ts (data access)                   │ │
│  │   anon client (supabase) for reads  ·  admin client for writes │ │
│  └──────────────────────────────┬─────────────────────────────────┘ │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │ SQL over HTTPS (PostgREST)
┌─────────────────────────────────▼───────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                           │
│  categories · authors · tags · posts · post_tags · menu_items       │
│  newsletter_subscribers · contact_submissions                       │
│  RLS enabled on all tables (public read/write, single-tenant)       │
└─────────────────────────────────────────────────────────────────────┘
        ▲
        │ uploads
┌───────┴────────┐
│   Cloudinary   │  (hero images uploaded from the admin panel)
└────────────────┘
```

**Data flow summary:**
1. **Readers** hit public pages. Server components call `lib/data.ts` functions, which query Supabase with the **anon key** (public RLS policies allow reads).
2. **Admins** log in at `/admin/login` (password check → signed JWT cookie). All `/admin/*` and `/api/admin/*` routes are protected by `middleware.ts`.
3. **Admin writes** (create/update/delete posts, upload images) use the **service-role key** (`supabaseAdmin`), which bypasses RLS. The middleware auth check is the real security boundary.
4. **View counting**: each article page mounts `<PostViewTracker>` which POSTs to `/api/posts/[slug]/view` (uses service role to increment `views`).
5. **Newsletter/Contact** forms POST to API routes, which insert rows into Supabase.

---

## 4. Repository Structure

```
Tatrix360/
├── package.json                  # ⚠️ LEFTOVER (Vite prototype) — ignore
├── project.json                  # ⚠️ Empty scaffold file — ignore
├── project.md                    # ⚠️ Empty template — ignore
├── .gitignore
└── frontend/                     # ✅ ALL REAL CODE LIVES HERE
    ├── package.json              # Next.js app dependencies & scripts
    ├── next.config.js            # reactStrictMode + image remote patterns
    ├── next-env.d.ts
    ├── tsconfig.json
    ├── tailwind.config.ts        # Design tokens, fonts, animations
    ├── postcss.config.js
    ├── components.json           # shadcn/ui config
    ├── globals.d.ts
    ├── middleware.ts             # 🔐 Admin route protection (JWT cookie)
    ├── netlify.toml              # Netlify deployment config
    ├── .vercelignore
    ├── .eslintrc.json
    ├── README.md                 # ⚠️ OUTDATED (still mentions Strapi)
    │
    ├── app/                      # Next.js App Router (pages + API)
    │   ├── layout.tsx            # Root layout: fonts, header, footer, providers
    │   ├── page.tsx              # 🏠 Homepage (hero + latest + trending)
    │   ├── providers.tsx         # ThemeProvider + Toaster + RouteTransition
    │   ├── fonts.ts              # Inter / Playfair / JetBrains Mono
    │   ├── globals.css           # CSS variables (light/dark), base styles
    │   ├── manifest.ts           # PWA manifest
    │   ├── robots.ts             # robots.txt
    │   ├── sitemap.ts            # sitemap.xml (posts + categories + static)
    │   ├── not-found.tsx         # 404 page
    │   ├── loading.tsx           # Global loading skeleton
    │   ├── icon.svg              # Site icon (used in PWA manifest)
    │   │
    │   ├── [category]/           # Dynamic category + slug route
    │   │   └── [slug]/
    │   │       ├── page.tsx      # 📄 Article page (SEO, JSON-LD, related)
    │   │       └── loading.tsx   # Article skeleton
    │   │
    │   ├── category/
    │   │   └── [slug]/page.tsx   # 🗂️ Category listing page
    │   │
    │   ├── latest/page.tsx       # Latest stories grid
    │   ├── search/page.tsx       # 🔍 Live search (⌘K)
    │   ├── about/page.tsx        # About page
    │   ├── contact/page.tsx      # Contact form
    │   ├── subscribe/page.tsx    # Newsletter signup
    │   │
    │   ├── admin/                # 🔐 Admin panel (password protected)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx          # 📋 Article dashboard (list + status)
    │   │   ├── login/page.tsx    # Password login form
    │   │   └── posts/
    │   │       └── new/page.tsx  # ✍️ Create/edit article form
    │   │
    │   ├── api/                  # Route handlers
    │   │   ├── admin/
    │   │   │   ├── login/route.ts        # POST password → JWT cookie
    │   │   │   ├── logout/route.ts       # POST clear cookie
    │   │   │   ├── posts/route.ts        # POST create / GET list
    │   │   │   ├── posts/[id]/route.ts   # PUT update / DELETE post
    │   │   │   └── upload/route.ts       # POST image → Cloudinary
    │   │   ├── contact/route.ts          # POST contact form
    │   │   ├── newsletter/route.ts       # POST subscribe
    │   │   ├── search/route.ts           # GET ?q= search
    │   │   └── posts/[slug]/view/route.ts# POST increment views
    │   │
    │   └── rss.xml/route.ts     # 📡 RSS 2.0 feed
    │
    ├── components/
    │   ├── PostViewTracker.tsx          # Client: fires view-count POST
    │   ├── useTrackPostView.tsx         # Hook used by tracker
    │   ├── article-actions.tsx          # Copy link + native share buttons
    │   ├── ui/                          # shadcn/ui primitives (47 files)
    │   │   ├── button.tsx, card.tsx, input.tsx, dialog.tsx, ...
    │   └── site/                        # Custom site components
    │       ├── site-header.tsx          # Sticky header, nav, theme toggle
    │       ├── site-footer.tsx
    │       ├── post-card.tsx            # PostCard, TrendingCard, CompactCard
    │       ├── newsletter-box.tsx
    │       ├── search-view.tsx          # Search UI with suggestions
    │       ├── contact-form.tsx
    │       ├── install-button.tsx       # PWA install (beforeinstallprompt)
    │       ├── theme-provider.tsx / theme-toggle.tsx
    │       ├── route-transition.tsx / navigation-events.tsx
    │       ├── skeletons.tsx
    │       ├── toaster.tsx
    │       ├── admin/
    │       │   ├── article-form.tsx     # Full article create/edit form
    │       │   ├── delete-post-button.tsx
    │       │   └── logout-button.tsx
    │       └── (unused, see §16):
    │           ad-slot.tsx, affiliate-card.tsx, badges.tsx,
    │           analytics.tsx, article-body.tsx, markdown.tsx,
    │           share-bar.tsx, view-tracker.tsx
    │
    ├── hooks/
    │   └── use-toast.ts          # Toast hook (shadcn)
    │
    ├── lib/
    │   ├── data.ts               # 🔑 ALL database access functions
    │   ├── types.ts              # Post, Category, Author, Tag, MenuItem
    │   ├── supabase.ts           # Anon public client + SITE_URL
    │   ├── supabase-admin.ts     # Service-role client (writes)
    │   ├── session.ts            # JWT create/verify (admin session)
    │   ├── views.ts              # View count helpers
    │   ├── categories.ts         # Static category metadata (icons/descriptions)
    │   ├── demo-data.ts          # ⚠️ Fully commented out (legacy fallback)
    │   └── utils.ts              # cn(), formatDate(), formatViews()
    │
    ├── supabase/
    │   └── migrations/
    │       └── 20260803015339_create_tatrix360_schema.sql  # Full schema
    │
    ├── backend/                  # ⚠️ LEGACY Strapi CMS — NOT USED ANYMORE
    │   ├── package.json
    │   ├── seed.js               # Old seed script for Strapi
    │   └── src/api/...           # Strapi content-types (post, author, ...)
    │
    └── public/
        └── og.svg                # Open Graph fallback image
```

---

## 5. Database Schema (Supabase)

The entire schema is defined in `frontend/supabase/migrations/20260803015339_create_tatrix360_schema.sql`. It creates **8 tables**, enables **RLS on every table**, and adds **indexes** for hot query paths.

> **Security model:** This is a single-tenant public site with no sign-in, so every table has `TO anon, authenticated USING (true)` policies — **all content is intentionally public**. Admin writes go through the service-role key instead (bypasses RLS), guarded by the app-level middleware auth.

### 5.1 Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `categories` | Article categories | `id`, `name`, `slug (UNIQUE)`, `description`, `sort_order` |
| `authors` | Writers | `id`, `name`, `slug (UNIQUE)`, `bio`, `avatar`, `role` |
| `tags` | Article tags | `id`, `name`, `slug (UNIQUE)` |
| `posts` | Articles | `id`, `title`, `slug (UNIQUE)`, `subtitle`, `content` (Markdown), `category_id` (FK), `author_id` (FK), `hero_image`, `post_type`, `seo_title`, `seo_description`, `featured`, `status`, `views`, `published_at` |
| `post_tags` | M2M join (posts ↔ tags) | `post_id` (FK, CASCADE), `tag_id` (FK, CASCADE), composite PK |
| `menu_items` | Nav menu links | `id`, `label`, `url`, `sort_order` |
| `newsletter_subscribers` | Newsletter signups | `id`, `email (UNIQUE)`, `created_at` |
| `contact_submissions` | Contact form entries | `id`, `name`, `email`, `message`, `created_at` |

### 5.2 `posts` — the core table

```sql
CREATE TABLE posts (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  subtitle        TEXT,
  content         TEXT,                 -- Markdown body
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id       INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  hero_image      TEXT,                 -- Cloudinary / Pexels URL
  post_type       TEXT DEFAULT 'News',  -- News | Review | Guide | Opinion
  seo_title       TEXT,
  seo_description TEXT,
  featured        BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'Published',  -- Draft | Published | Archived
  views           INTEGER NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ DEFAULT now()
);
```

### 5.3 Indexes

```sql
idx_posts_slug · idx_posts_category_id · idx_posts_author_id
idx_posts_featured · idx_posts_published_at (DESC) · idx_posts_status
idx_categories_slug · idx_authors_slug · idx_tags_slug · idx_newsletter_email
```

### 5.4 RLS policy pattern (applied to every table)

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_<table>" ON <table> FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_<table>" ON <table> FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_<table>" ON <table> FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_<table>" ON <table> FOR DELETE TO anon, authenticated USING (true);
```

*(Newsletter + contact tables only have `SELECT` and `INSERT` policies — no update/delete.)*

### 5.5 Category slugs used across the app

| Slug | Display Name | Notes |
|---|---|---|
| `ai` | AI | |
| `android` | Android | |
| `ios` | iOS | |
| `gadgets` | Gadgets | |
| `deals` | Deals | |
| `how-to` | How-To | Note hyphen: `how-to` |
| `tech` | Tech | Appears in DB/categories page, no header icon |

---

## 6. Features

### 6.1 Public site

| Feature | Where | Details |
|---|---|---|
| 🏠 **Homepage** | `/` | Hero (featured post), latest stories grid, trending-by-views sidebar, category quick links, newsletter CTA |
| 📄 **Article pages** | `/{category}/{slug}` | Breadcrumbs, category badge, author byline + avatar, Markdown body, share bar, related posts, view counter |
| 🗂️ **Category pages** | `/category/{slug}` | Filtered post listing per category |
| 📰 **Latest** | `/latest` | 20 most recent published posts |
| 🔍 **Live search** | `/search` + `⌘K` | Debounced API search with suggestions, results exclude suggestion duplicates |
| ✉️ **Newsletter** | `/subscribe` + boxes | Email stored in `newsletter_subscribers` (duplicates handled gracefully) |
| 📬 **Contact** | `/contact` | Form with honeypot spam trap + server validation |
| 🌓 **Dark/light theme** | Header toggle | Default dark, persisted via `next-themes` |
| 📡 **RSS feed** | `/rss.xml` | RSS 2.0, latest 50 posts, `s-maxage=3600` cache |
| 🗺️ **Sitemap + robots** | `/sitemap.xml`, `/robots.txt` | All static + category + post URLs; sitemap revalidates hourly |
| 📈 **SEO** | Article pages | `seoTitle`/`seoDescription` per post, JSON-LD `NewsArticle`, canonical URLs, Open Graph, Twitter cards |
| 📱 **PWA install** | Header button | `beforeinstallprompt` + iOS instructions, manifest + icon |
| ⚡ **UX polish** | Global | Route transitions, skeleton loaders, animated hero, `loading-bar` animation |
| 👁️ **View counting** | Article pages | Client tracker POSTs to increment `views`, used for trending |
| 📊 **Analytics** | Global | Vercel Speed Insights |

### 6.2 Admin panel (password protected)

| Feature | Route | Details |
|---|---|---|
| 🔐 **Login** | `/admin/login` | Password check against `ADMIN_PASSWORD`, JWT cookie (7 days, httpOnly) |
| 📋 **Dashboard** | `/admin` | Lists ALL posts (incl. drafts/archived) with status badges, "New Article" button, edit/delete |
| ✍️ **Create/Edit article** | `/admin/posts/new` | Full form: title (auto-slug), subtitle, Markdown content, category dropdown, author find-or-create, tags find-or-create, hero image upload (Cloudinary), post type, SEO fields, featured toggle, status (Draft/Published/Archived) |
| 🖼️ **Image upload** | `/api/admin/upload` | Validates type (JPEG/PNG/WebP/GIF) + size (≤5 MB), uploads to Cloudinary `tatrix360` folder |
| 🗑️ **Delete** | dashboard | Deletes `post_tags` rows + post |
| 🚪 **Logout** | dashboard | Clears session cookie |

---

## 7. Routing Map

### 7.1 Public pages

| Route | File | Type |
|---|---|---|
| `/` | `app/page.tsx` | Server Component |
| `/{category}/{slug}` | `app/[category]/[slug]/page.tsx` | Server Component + `generateStaticParams` |
| `/category/{slug}` | `app/category/[slug]/page.tsx` | Server Component |
| `/latest` | `app/latest/page.tsx` | Server Component |
| `/search` | `app/search/page.tsx` | Client view inside server page |
| `/about` | `app/about/page.tsx` | Server Component |
| `/contact` | `app/contact/page.tsx` | Server Component |
| `/subscribe` | `app/subscribe/page.tsx` | Server Component |
| `/rss.xml` | `app/rss.xml/route.ts` | Route Handler |
| `/sitemap.xml` | `app/sitemap.ts` | Metadata route |
| `/robots.txt` | `app/robots.ts` | Metadata route |
| `/manifest.webmanifest` | `app/manifest.ts` | Metadata route |

### 7.2 Admin routes (protected by `middleware.ts`)

| Route | File | Method |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | GET |
| `/admin/login` | `app/admin/login/page.tsx` | GET |
| `/admin/posts/new` | `app/admin/posts/new/page.tsx` | GET |
| `/api/admin/login` | `app/api/admin/login/route.ts` | POST |
| `/api/admin/logout` | `app/api/admin/logout/route.ts` | POST |
| `/api/admin/posts` | `app/api/admin/posts/route.ts` | GET / POST |
| `/api/admin/posts/[id]` | `app/api/admin/posts/[id]/route.ts` | PUT / DELETE |
| `/api/admin/upload` | `app/api/admin/upload/route.ts` | POST |

### 7.3 Public API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/search?q=` | GET | Returns `{ results, suggestions }` |
| `/api/newsletter` | POST | Subscribe email |
| `/api/contact` | POST | Submit contact form (honeypot protected) |
| `/api/posts/[slug]/view` | POST | Increment post view count |

### 7.4 Middleware (`middleware.ts`)

- Matcher: `/admin/:path*` and `/api/admin/:path*`
- Verifies the `admin_session` cookie (JWT) on every matching request
- Login page & login API are excluded (no redirect loop); a logged-in user visiting `/admin/login` is redirected to `/admin`
- All other admin paths redirect to `/admin/login` when unauthenticated

---

## 8. Data Layer API

All database access lives in **`frontend/lib/data.ts`** (556 lines). It maps Supabase snake_case rows to camelCase TypeScript interfaces (`lib/types.ts`) via explicit mapper functions.

### Public read functions (anon client)

| Function | Description |
|---|---|
| `getPosts({ featured?, pageSize?, categorySlug? })` | Published posts, newest first. `featured` filters flag; `categorySlug` does a category-id lookup first (works around a PostgREST embedded-filter limitation) |
| `getPostBySlug(slug)` | Single published post by slug |
| `getPostByCategoryAndSlug(category, slug)` | Returns `{ status: 'ok' }`, `{ status: 'wrong-category', post, correctCategorySlug }`, or `{ status: 'not-found' }` — powers the canonical-redirect behavior |
| `getTrendingPosts(limit=5)` | Published posts ordered by `views` DESC |
| `getCategories()` | All categories ordered by `sort_order` |
| `getAuthors()` / `getTags()` | All authors / tags |
| `getMenu()` | Nav links ordered by `sort_order` |
| `searchPosts(query)` | `ILIKE '%query%'` on title, limit 20 |
| `subscribeEmail(email)` | Insert into `newsletter_subscribers`; code `23505` (duplicate) treated as success |
| `submitContact(name, email, message)` | Insert into `contact_submissions` |

### Admin write functions (service-role client)

| Function | Description |
|---|---|
| `getAdminPosts()` | All posts (any status), newest id first, limit 200 |
| `getPostById(id)` | Single post by id |
| `createPost(input)` | Creates post + **find-or-create** author & tags + syncs `post_tags` |
| `updatePost(id, input)` | Updates post + re-syncs author/tags/join rows |
| `deletePost(id)` | Deletes `post_tags` first, then the post |

**Find-or-create pattern:** `findOrCreateAuthorId(name)` and `findOrCreateTagIds(names[])` match by case-insensitive name (`ILIKE`), insert if missing, and auto-slugify. Used so admins can type a brand-new author/tag name and it just works. Category, by contrast, is a strict dropdown (always a real `category_id`).

**Joined selects** use named FK syntax to guarantee correct joins:
```ts
.select(`
  *,
  categories!posts_category_id_fkey (*),
  authors!posts_author_id_fkey (*),
  post_tags ( tags (*) )
`)
```

---

## 9. Authentication & Security

### 9.1 Admin session flow

1. `/api/admin/login` compares posted password with `ADMIN_PASSWORD` env var.
2. On success, `lib/session.ts` signs a JWT `{ role: 'admin' }` (HS256, `SESSION_SECRET`, 7-day expiry) with `jose`.
3. The token is set as an **httpOnly, sameSite=lax, secure (prod)** cookie named `admin_session`.
4. `middleware.ts` verifies the token on every `/admin/*` and `/api/admin/*` request.
5. Logout clears the cookie.

### 9.2 Security boundaries

- **Public reads** → anon key + public RLS (all data intentionally public).
- **Admin writes** → service-role key (`SUPABASE_SERVICE_ROLE_KEY`) via `supabaseAdmin`, which **bypasses RLS**. This key must NEVER be exposed to the client — it is only imported by server-side code (`lib/supabase-admin.ts`).
- **Image uploads** → type + size whitelist, Cloudinary server-side SDK.
- **Contact form** → honeypot field (`company`) silently succeeds if filled (bot trap) + server-side required-field and email-format validation + 5000-char message cap.
- **Newsletter** → email regex validation; duplicate inserts handled.
- **Admin form validation** → publish requires category + author + ≥1 tag.

### 9.3 Env vars never in the repo

All secrets (`.env`, `.env.local`) are gitignored. See [§10](#10-environment-variables).

---

## 10. Environment Variables

Create `frontend/.env.local` (and/or set these in Vercel/Netlify):

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key (public — safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service-role key (**secret** — server only; bypasses RLS) |
| `ADMIN_PASSWORD` | ✅ | Password for the `/admin` panel |
| `SESSION_SECRET` | ✅ | ≥32-char secret used to sign admin JWT cookies |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary account name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `NEXT_PUBLIC_SITE_URL` | ⬜ | Canonical site URL (defaults to `https://tatrix360.vercel.app` in `lib/supabase.ts`, `https://tatrix360.com` in layouts) |

> ⚠️ **Gotcha:** `lib/supabase-admin.ts` **throws** at import time if `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing. Ensure all required vars exist before building.

---

## 11. Local Development Setup

### Prerequisites
- Node.js ≥ 18 (Strapi backend requires ≤ 20.x if you ever run it, but it's unused)
- A Supabase project (free tier works) — create one at [supabase.com](https://supabase.com)

### Step 1 — Clone & install

```bash
git clone https://github.com/jabid2003/Tatrix360.git
cd Tatrix360/frontend
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env.local   # or create it manually
```

Fill in all values from [§10](#10-environment-variables).

### Step 3 — Set up the database

1. Open your Supabase project → **SQL Editor**.
2. Run the entire contents of `frontend/supabase/migrations/20260803015339_create_tatrix360_schema.sql`.
3. (Optional) Insert seed data:
   ```sql
   INSERT INTO categories (name, slug, description, sort_order) VALUES
     ('AI', 'ai', 'Artificial intelligence news, explainers, and tools.', 1),
     ('Android', 'android', 'Android OS news, updates, and deep dives.', 2),
     ('iOS', 'ios', 'iOS news, updates, and deep dives.', 3),
     ('Gadgets', 'gadgets', 'Hardware reviews and hands-on impressions.', 4),
     ('Deals', 'deals', 'The best tech deals, vetted.', 5),
     ('How-To', 'how-to', 'Practical guides and tutorials.', 6);

   INSERT INTO menu_items (label, url, sort_order) VALUES
     ('AI', '/category/ai', 1),
     ('Android', '/category/android', 2),
     ('iOS', '/category/ios', 3),
     ('Gadgets', '/category/gadgets', 4),
     ('Deals', '/category/deals', 5),
     ('How-To', '/category/how-to', 6),
     ('About', '/about', 7);
   ```

### Step 4 — Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

- Public site: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin` (password = `ADMIN_PASSWORD`)

### Step 5 — Build & lint

```bash
npm run build     # production build
npm run lint      # ESLint (next lint)
```

---

## 12. Deployment Guide

### 12.1 Vercel (primary — what the live site uses)

1. Push the repo to GitHub and import it in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add all env vars from [§10](#10-environment-variables).
4. Deploy. Build command is auto-detected (`next build`); output is server-rendered (no `output: export`), so use the default function-based deployment.
5. Vercel Speed Insights is already wired via `@vercel/speed-insights`.

### 12.2 Netlify (config already included)

`frontend/netlify.toml` is ready:
```toml
[build]
command = "npx next build"
publish = ".next"

[[plugins]]
package = "@netlify/plugin-nextjs"
```
Set root directory to `frontend`, add env vars, deploy.

### 12.3 Post-deploy checklist

- [ ] Homepage renders hero + latest stories
- [ ] `/admin` login works and CRUD operations persist
- [ ] Image upload returns a Cloudinary URL
- [ ] `/rss.xml`, `/sitemap.xml`, `/robots.txt` respond
- [ ] Search (`⌘K`) returns results
- [ ] Newsletter + contact submissions appear in Supabase tables

---

## 13. Design System

### 13.1 Fonts (`app/fonts.ts`, loaded via `next/font/google`)

| Role | Font | CSS variable |
|---|---|---|
| Sans (body/UI) | Inter | `--font-inter` |
| Serif (headlines) | Playfair Display | `--font-playfair` |
| Mono (code) | JetBrains Mono | `--font-mono` |

### 13.2 Colors (`app/globals.css` — HSL CSS variables)

**Light mode:**
```css
--background: 0 0% 100%;        --foreground: 222 47% 11%;
--primary: 199 89% 48%;          /* sky blue #0ea5e9 */
--primary-foreground: 0 0% 100%;
--muted: 210 40% 96%;            --muted-foreground: 215 16% 47%;
--border: 214 32% 91%;           --ring: 199 89% 48%;
--success: 142 71% 45%;          --warning: 38 92% 50%;
```

**Dark mode (default):** deep navy backgrounds (`222 47% 7%` → `10%` cards), lighter text, same sky-blue primary.

> The accent color is **sky blue (#0ea5e9)**. To rebrand, change the `--primary`/`--ring`/`--accent` values in both `:root` and `.dark` blocks.

### 13.3 Custom Tailwind tokens (`tailwind.config.ts`)

- `container-page` utility (custom, defined in globals.css)
- Radius: `rounded-2xl` (1rem), `rounded-3xl` (1.5rem)
- Shadows: `shadow-soft`, `shadow-glow` (primary glow)
- Animations: `shimmer`, `in-up`, `in-fade`, `scale-in`, `loading-bar`
- Layout classes: `container-page`, `animate-in-up stagger-N`, `line-clamp-N`

### 13.4 UI components

- **shadcn/ui** (Radix primitives + `cva`), 47 components in `components/ui/`
- Typography for article Markdown: `@tailwindcss/typography` plugin (`prose` classes)
- Toasts via `sonner` (global `<Toaster />` in `providers.tsx`)
- Icons: `lucide-react` (header maps each menu URL to an icon)

### 13.5 Layout anatomy

```
<RootLayout>
  <Providers>              → ThemeProvider (next-themes, dark default)
    <NavigationEvents />
    <SiteHeader menu={menu} />   → sticky, backdrop-blur, nav icons, search ⌘K, theme toggle, install button
    <main>
      <RouteTransition>    → subtle enter animations
        {children}
      </RouteTransition>
    </main>
    <SiteFooter />
  </Providers>
  <SpeedInsights />
</RootLayout>
```

---

## 14. Code Conventions & Patterns

> This section is critical for anyone (human or AI) modifying the codebase. Follow these patterns to stay consistent.

1. **Data access is centralized in `lib/data.ts`** — pages/APIs never call Supabase directly. Add new queries here.
2. **Type mapping**: Supabase snake_case rows → camelCase TS interfaces (`Post`, `Category`, `Author`, `Tag`, `MenuItem` in `lib/types.ts`) using `mapPost`/`mapCategory`/`mapAuthor`/`mapTag`.
3. **Named FK joins** in select strings (`categories!posts_category_id_fkey (*)`) — always use this syntax to avoid ambiguous joins.
4. **`force-dynamic` on data pages**: `export const dynamic = 'force-dynamic'; export const revalidate = 0;` at the top of any page that reads posts. The site is intentionally always-live (no ISR caching for content).
5. **Anon client for reads, service-role for writes**: never import `supabaseAdmin` into a client component; admin writes only happen in server-side routes behind middleware.
6. **Find-or-create for author/tags** by name; **category is a strict dropdown** (no free-text category creation).
7. **Slugify helper** duplicated in `lib/data.ts` and `article-form.tsx` — lowercase, trim, replace non-alphanumerics with `-`.
8. **Category/slug route validation**: use `getPostByCategoryAndSlug()` in the article page. `wrong-category` → `redirect()` to canonical URL; `not-found` → `notFound()`. Never render or 404 when content exists at another URL.
9. **SEO per post**: use `seoTitle`/`seoDescription` when present; canonical URL always built from the post's real category slug.
10. **Client components** must start with `'use client'` — used for search, theme, toasts, view tracking, install button, article actions, admin form.
11. **Tailwind tokens only** — no arbitrary hardcoded colors in components; use `bg-primary`, `text-muted-foreground`, `border-border`, etc.
12. **Markdown content** is rendered server-side (see `components/site/article-body.tsx` + `markdown.tsx`, currently unwired — see §16).
13. **Newsletter duplicate emails**: catch Postgres code `23505` and treat as success.
14. **Uploads**: whitelist `image/jpeg|png|webp|gif`, max 5 MB, Cloudinary folder `tatrix360`.
15. **Comments in code are extensive and intentional** — the codebase documents *why* decisions were made (e.g., the PostgREST embedded-filter workaround, the wrong-category redirect). Preserve them when editing.

---

## 15. Known Quirks & Technical Decisions

1. **Strapi is gone but the folder remains.** `frontend/backend/` is a legacy Strapi 5 CMS (content-types, seed script). Git history shows "Removed unused Strapi CMS" — **do not use it**; it's dead weight and safe to delete. The old `frontend/README.md` still describes Strapi and is **outdated**.
2. **Root `package.json`, `project.json`, `project.md`** are leftovers from the earliest Vite prototype. They are unused. The real app is in `frontend/`.
3. **`lib/demo-data.ts` is fully commented out.** The old "fallback demo data if backend unreachable" strategy was removed; the app now depends on Supabase being reachable.
4. **`force-dynamic` everywhere** means every page hit queries Supabase. No edge caching for content pages (RSS has `s-maxage=3600`, sitemap `revalidate = 3600`).
5. **Two different default URLs** exist: `lib/supabase.ts` defaults `SITE_URL` to `https://tatrix360.vercel.app`; `app/layout.tsx` and the article page default to `https://tatrix360.com`. Set `NEXT_PUBLIC_SITE_URL` to keep them consistent.
6. **Menu icons are URL-keyed** (`components/site/site-header.tsx` `iconMap`): each nav URL maps to a lucide icon; unknown URLs fall back to a `Circle` icon.
7. **Categories are partly duplicated**: `lib/categories.ts` holds static metadata (descriptions) while the DB `categories` table is the source of truth for what appears in the menu/listing. `tech` exists in the DB but has no header icon.
8. **View counting** is client-triggered (fire-and-forget POST), so views can be inflated by bots; it's good enough for trending.
9. **`post_tags` sync on update** is delete-then-reinsert (simple, fine at this scale).
10. **No image optimization for Pexels** beyond Next.js `next/image` remote patterns (`images.pexels.com`, `res.cloudinary.com`).
11. **Admin has no multi-user model** — single shared password. Scaling to teams requires a real auth provider (see roadmap).

---

## 16. Unused / Available Components

These components exist but are **not imported anywhere** — they're ready to wire up for future features:

| Component | Purpose |
|---|---|
| `components/site/ad-slot.tsx` | Ad placement slot (probably wants an ad network ID) |
| `components/site/affiliate-card.tsx` | Affiliate product card |
| `components/site/badges.tsx` | Badge helpers |
| `components/site/analytics.tsx` | Analytics component (Vercel Speed Insights is wired separately in layout) |
| `components/site/article-body.tsx` + `markdown.tsx` | Markdown renderer for article content (wraps `@tailwindcss/typography`) — article pages currently render `content` raw in `whitespace-pre-line` style |
| `components/site/share-bar.tsx` | Share bar (article page uses `components/article-actions.tsx` instead) |
| `components/site/view-tracker.tsx` | Older view tracker (article page uses `components/PostViewTracker.tsx`) |

Also installed-but-largely-unused libs: `recharts` (charts), `react-hook-form`, `embla-carousel-react`, `vaul`, `input-otp`, `cmdk`.

---

## 17. Common Modification Recipes

### ➕ Add a new category
1. Insert a row in Supabase `categories` (name, slug, description, sort_order).
2. Insert a matching `menu_items` row if it should appear in the header.
3. (Optional) Add an icon mapping in `site-header.tsx` `iconMap`.
4. (Optional) Add static metadata in `lib/categories.ts`.
5. Category page `/category/{slug}` works automatically.

### ➕ Add a new field to posts
1. `ALTER TABLE posts ADD COLUMN ...` (or edit the migration).
2. Add it to the `PostRow` interface + `mapPost()` in `lib/data.ts`.
3. Add it to `Post` in `lib/types.ts`.
4. Add form control in `components/site/admin/article-form.tsx` + include in the `payload` sent to `/api/admin/posts`.
5. Add the column to `PostInput` and the insert/update in `lib/data.ts`.

### 🎨 Change the brand color
Edit `--primary`, `--accent`, `--ring` in both `:root` and `.dark` blocks of `app/globals.css` (default: sky blue `199 89% 48%`).

### 🌐 Change the site name / tagline
Update the `metadata` object in `app/layout.tsx`, `app/manifest.ts`, the footer, and `app/rss.xml/route.ts`.

### 🔍 Improve search
Currently `ILIKE '%q%'` on title only. To search content too, extend `searchPosts()` in `lib/data.ts` (e.g., `OR content ilike`), or switch to Postgres full-text search (a `supabase-postgres-best-practices` skill folder exists in `.agents/`).

### 📄 Change homepage layout
Edit `app/page.tsx` (hero + latest + trending composition) and `components/site/post-card.tsx` (card variants: `PostCard`, `TrendingCard`, `CompactCard`).

### 🖼️ Switch image provider
Replace the Cloudinary logic in `app/api/admin/upload/route.ts` (and update `next.config.js` remote patterns).

---

## 18. Ideas & Roadmap

- **Real authentication** (Supabase Auth / Auth.js) to replace the single shared admin password.
- **Markdown rendering** — wire up `article-body.tsx`/`markdown.tsx` so `content` renders with typography styling (currently plain text).
- **WYSIWYG editor** for the admin form.
- **Pagination** on `/latest` and category pages (data layer already supports `pageSize`).
- **Scheduled publishing** (auto-publish drafts by `published_at`).
- **Author pages** (`/author/{slug}`) using existing `authors` data.
- **Tag pages** (`/tag/{slug}`).
- **Ads & affiliate blocks** — wire up `ad-slot.tsx` / `affiliate-card.tsx`.
- **Email delivery** for the newsletter (currently just DB storage).
- **Analytics dashboard** in admin using `recharts` + the `views` column.
- **i18n / multi-language** support.
- **Content moderation / drafts review** workflow.
- **Full-text search** with Postgres FTS + ranking.
- **Static generation / ISR** for better performance if content update frequency allows.

---

## 19. License

The Strapi backend declares **MIT**; the frontend package is private. The overall project license is not explicitly declared — contact the maintainer before reuse.

---

*README generated from a full source-code analysis of the Tatrix360 repository (frontend + Supabase migration + deployment configs) and the live site at [tatrix360.vercel.app](https://tatrix360.vercel.app/).*
