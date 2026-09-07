# StudySphere

**Search. Share. Study.**

A full-stack academic resource discovery platform. Students upload and share notes; unified search also finds trusted educational pages from the open web. External results are links to the original source — files are not re-hosted.

## Stack

Next.js · TypeScript · Tailwind CSS · Auth.js · Prisma · SQLite (local) / PostgreSQL-ready schema · Vitest

Local development uses SQLite so the app runs without Docker. The Prisma schema is the same shape you would deploy to PostgreSQL.

## Setup

```bash
cd studysphere
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role    | Email                     | Password   |
| ------- | ------------------------- | ---------- |
| Student | student@studysphere.dev   | Student123 |
| Admin   | admin@studysphere.dev     | Admin123   |

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

## Optional external search API

Add a Brave Search key to `.env` as `BRAVE_SEARCH_API_KEY` to include live web results. Without a key, search still uses the seeded educational catalog plus Wikipedia and Open Library.

## Tests

```bash
npm test
```

## AI layer (not in v1)

Semantic search (pgvector), PDF summarization, and RAG “ask this note” are the planned v2 layer. Build those only after this search-and-notes MVP is solid.
