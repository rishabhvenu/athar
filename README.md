# Athar

A Quran reflection journal, built as a progressive web app. You tie a verse to a moment in your life, write down what it meant to you, and the app brings those moments back later.

> **Status: work in progress.** The data model, auth, and capture flow are in place. Quran semantic search (`src/lib/mcp.ts`) still returns placeholder data.

## Features

- **Read**: verses and tafsir from the [Quran.com API](https://api.quran.com), cached for a day per verse.
- **Capture**: save a verse with a mood and a note. If you skip the mood, Gemini classifies the note into one of six (calm, anxious, grateful, grieving, seeking, joyful).
- **Search**: notes are embedded with `text-embedding-004` and stored in pgvector, so you can search your own reflections by meaning rather than keyword.
- **Today**: a daily card resurfaces an old memory (on its anniversary, when it matches your mood, or when it has gone untouched), and you can add a new reflection to it.
- **Memory Map**: a timeline of everything you've saved.
- **Wrapped**: a year-in-review with your most common mood.

## Stack

- Next.js 16 (App Router, server actions), React 19, Tailwind CSS 4
- Supabase: Postgres with row-level security on every table, auth, pgvector, pg_cron
- Google Gemini for mood inference and embeddings
- Vitest, Testing Library, MSW, and Playwright, run in GitHub Actions on pushes to main and on every pull request

## Running locally

Requires Node 20+, pnpm, and a Supabase project.

```bash
pnpm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

Apply the migrations in `supabase/migrations`, then:

```bash
pnpm dev          # http://localhost:3000
pnpm test         # unit tests
pnpm test:e2e     # Playwright
```
