# StudySphere

**Search. Share. Study.**

A full-stack academic resource discovery platform. Students upload and share notes; unified search also finds trusted educational pages from the open web. External results are links to the original source — files are not re-hosted.

## Stack

Next.js · TypeScript · Tailwind CSS · Auth.js · Prisma · **PostgreSQL (Neon)** · Vercel Blob (production files) · Vitest

## Setup (local)

1. Copy `.env.example` → `.env` and set a PostgreSQL `DATABASE_URL` + matching `DIRECT_URL` (Neon free tier or any Postgres).
2. Keep `UPLOAD_DIR=./uploads` for local files. Leave Blob tokens unset locally.
3. Install and migrate:

```bash
cd studysphere
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The previous SQLite file `prisma/dev.db` is retained as a local backup only. Prisma now targets PostgreSQL.

### Demo accounts

| Role    | Email                     | Password   |
| ------- | ------------------------- | ---------- |
| Student | student@studysphere.dev   | Student123 |
| Admin   | admin@studysphere.dev     | Admin123   |

## Vercel deployment checklist (do not auto-deploy from this README)

Configure these yourself before deploying:

1. **Neon** — create a Postgres project; copy pooled URL → `DATABASE_URL`, direct URL → `DIRECT_URL`.
2. Run migrations once against Neon: `npx prisma migrate deploy` (from your machine or CI), then optionally `npx prisma db seed`.
3. **Vercel** — import the repo / `studysphere` app root; set env vars from `.env.example`.
4. **Vercel Blob** — create a **Private** store, connect it to the project (`BLOB_READ_WRITE_TOKEN` / store OIDC).
5. Set `AUTH_SECRET` and production `AUTH_URL`.
6. Build command uses `prisma generate && next build` (migrations are **not** run during the Vercel build).

See [docs/VERCEL_MIGRATION.md](./docs/VERCEL_MIGRATION.md) for details, blockers, and serverless notes.

## What is implemented

- Registration, login, logout, hashed passwords, email verification, forgot/reset password, student/admin roles
- Note upload, download, PDF preview, subjects, tags
- Unified search: community notes + Wikipedia / Open Library / catalog, with optional Brave Search API
- Weighted ranking, filters, and trusted-domain boosts
- Ratings (one per user+note), bookmarks, reports, sharing
- Student dashboard and library
- Admin users, notes, reports, subjects, trusted sources, analytics (including search success rate)
- Rate limiting, file type/size checks, path-safe storage
- Unit tests for ranking, permissions, and file validation

## Email

Delivered through [Resend](https://resend.com). Set `RESEND_API_KEY` and `EMAIL_FROM`
(with a verified sending domain) to enable:

- email verification
- forgot password
- password reset

Without those variables no mail is sent; outside production the register and
forgot-password responses return the link directly so local development still works.

## Rate limiting (serverless note)

The current limiter is **in-memory per instance**. On Vercel this is not shared across serverless isolates, so limits are best-effort only. Replace with Redis/Upstash later if needed — not changed in this migration.

## Optional external search API

Add a Brave Search key to `.env` as `BRAVE_SEARCH_API_KEY` to include live web results. Without a key, search still uses the seeded educational catalog plus Wikipedia and Open Library.

## Tests

```bash
npm test
```

## AI layer (not in v1)

Semantic search (pgvector), PDF summarization, and RAG “ask this note” are the planned v2 layer. Build those only after this search-and-notes MVP is solid.
