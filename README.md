# SmartMark — Real-Time Bookmark Manager

A beautiful, real-time bookmark manager built with **Next.js 15** (App Router), **Supabase** (Auth, Database, Realtime), and **Tailwind CSS**.

![SmartMark](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=flat-square&logo=supabase) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)

## ✨ Features

- **Google OAuth** — Sign in with your Google account (no email/password)
- **Add & Delete Bookmarks** — Save URLs with titles, remove them when done
- **Real-time Sync** — Open two tabs; add a bookmark in one and it appears in the other instantly
- **Private Bookmarks** — Row Level Security ensures User A cannot see User B's bookmarks
- **Beautiful Dark UI** — Glassmorphism cards, gradient accents, smooth animations

## 🚀 Live Demo

> **[Live Vercel URL]** — (update after deployment)

## 🛠 Tech Stack

| Layer        | Technology               |
| ------------ | ------------------------ |
| Framework    | Next.js 15 (App Router)  |
| Auth         | Supabase Auth (Google)   |
| Database     | Supabase PostgreSQL      |
| Realtime     | Supabase Realtime        |
| Styling      | Tailwind CSS 4           |
| Deployment   | Vercel                   |

## 📦 Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd smart-book-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon key** from Settings → API

### 3. Set up the database

Open the **SQL Editor** in Supabase Dashboard and run the contents of [`supabase-schema.sql`](./supabase-schema.sql).

This creates the `bookmarks` table with:
- Row Level Security policies (users can only CRUD their own bookmarks)
- Realtime enabled on the table
- An index on `user_id` for performance

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → Google, enable Google and paste your Client ID and Client Secret

### 5. Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!
5. **Important**: Add your Vercel domain to Supabase Auth → URL Configuration → Redirect URLs: `https://your-app.vercel.app/auth/callback`

## 🐛 Problems & Solutions

### 1. Supabase SSR Cookie Handling

**Problem**: The initial approach using `createClient` from `@supabase/supabase-js` directly doesn't work with Next.js App Router server components because cookies need to be forwarded for authentication.

**Solution**: Used `@supabase/ssr` package which provides `createBrowserClient` and `createServerClient` with proper cookie handling. The server client reads/writes cookies using Next.js's `cookies()` API, and the middleware refreshes sessions on every request.

### 2. Realtime DELETE Events and RLS

**Problem**: When Supabase Realtime is used with Row Level Security, DELETE events don't include the full row data and the `filter` parameter on the channel doesn't work for DELETE events (since the row no longer exists to check against).

**Solution**: Subscribed to DELETE events without a `user_id` filter and instead relied on the `old.id` field from the payload to remove the correct bookmark from local state. Since only a user's own bookmarks are loaded initially, this is safe — we only remove items from our already-filtered list.

### 3. OAuth Redirect URI Mismatch

**Problem**: After deploying to Vercel, Google OAuth login failed because the redirect URI was still pointing to `localhost`.

**Solution**: Added the production Vercel URL to both Google Cloud Console's authorized redirect URIs and Supabase Auth's redirect URL allowlist. The OAuth callback handler (`/auth/callback/route.ts`) also checks for `x-forwarded-host` to handle proxy environments correctly.

### 4. Middleware Session Refresh

**Problem**: Users were being logged out unexpectedly because their Supabase JWT tokens expired without being refreshed.

**Solution**: Implemented Next.js middleware that runs on every request, creating a Supabase server client that transparently refreshes the session and updates cookies. This ensures the user stays logged in as long as their refresh token is valid.

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout (Inter font, metadata)
│   ├── page.tsx                # Landing page with Google sign-in
│   ├── globals.css             # Tailwind + custom animations
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard (SSR)
│   └── auth/
│       └── callback/
│           └── route.ts        # OAuth callback handler
├── components/
│   ├── AuthButton.tsx          # Google sign-in / sign-out
│   ├── AddBookmark.tsx         # Bookmark form
│   ├── BookmarkCard.tsx        # Individual bookmark card
│   └── BookmarkList.tsx        # Real-time bookmark list
├── lib/
│   ├── supabase-browser.ts     # Browser Supabase client
│   └── supabase-server.ts      # Server Supabase client
├── middleware.ts               # Auth middleware
└── supabase-schema.sql         # Database schema
```

## 📜 License

MIT
