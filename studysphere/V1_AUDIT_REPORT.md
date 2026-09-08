# StudySphere V1 Audit Report

Updated: 2026-09-08 (post High/Medium remediation)

## Overall V1 readiness: **RESUME READY**

All High/Medium audit findings from the initial V1 audit have been fixed. Lint (0 errors), typecheck, unit tests (19), and smoke tests (23/23) pass. Manual API/security checks for bookmarks, pagination, file preview auth, search-click auth, and admin RBAC verified.

---

## Fixed issues

### BUG-001 (High) — Bookmark 500 → **FIXED**
- `createNoteBookmark()` validates published note existence before insert.
- Nonexistent `noteId` → **404** `{ ok:false, error:"Note not found" }`
- Valid note → **201**; duplicate → **200** with existing bookmark

### BUG-005 (Medium) — Lint setState-in-effect → **FIXED**
- Admin users/notes/reports/subjects/sources: server pages load data; client islands only for mutations
- Admin analytics: pure server component via shared `getAdminAnalytics()`
- Verify-email: initial message derived from token; no sync setState in effect

### BUG-003 (Medium) — Anonymous search click → **FIXED**
- Requires authenticated session (**401** if guest)
- Validates search event exists; rejects other users’ events (**403**)
- Validates `clickType` ∈ `community|external`
- Rate limit: 60 clicks / minute / user
- Max event age: 24h

### BUG-004 (Medium) — Public file preview → **FIXED**
- `GET /api/files/...` requires auth (**401** guest)
- Exact `fileUrl` match only (no path guessing)
- Note page shows “Sign in to preview” for guests; iframe for authenticated PDF

### BUG-002 (Medium) — Search pagination → **FIXED**
- `page` / `pageSize` applied to **community** results
- Response includes `pagination: { page, pageSize, communityTotal, communityTotalPages, webTotal, webPaginated:false }`
- Invalid `page=0` → **400**
- **Documented limitation:** external/web results are provider-capped (~12) and returned in full on every page (not slice-paginated)

---

## Tests added

| File | Coverage |
|------|----------|
| `src/__tests__/bookmarks.test.ts` | nonexistent → 404; create → 201; duplicate → 200 |
| `src/__tests__/search-click.test.ts` | missing event; wrong owner; valid click |
| `src/__tests__/pagination.test.ts` | schema defaults/validation; distinct page slices |
| `scripts/smoke-test.ps1` | guest preview **401**; auth preview **200** |

---

## Test results (after fixes)

| Suite | Result |
|-------|--------|
| `npm run lint` | **PASS** — 0 errors |
| `npx tsc --noEmit` | **PASS** |
| `npx vitest run` | **PASS** — 19/19 |
| `npm run smoke` | **PASS** — 23/23 |

### Manual verification checklist

| # | Check | Result |
|---|-------|--------|
| 1 | Fake bookmark ID | **404** Note not found |
| 2 | Normal + duplicate bookmark | **201/200** |
| 3 | Search page 1 (`pageSize=1`) | 1 result, `page=1` |
| 4 | Search page 2 | Different note id |
| 5 | Authenticated file preview | **200** |
| 6 | Guest file access | **401** |
| 7 | Authenticated search click | **200** |
| 8 | Guest search click | **401** |
| 9 | Admin analytics | **200** |
| 10 | Student → admin API / page | **403** / **307** |

---

## Remaining known limitations (Low / deferred)

- No fuzzy/spell-correct search (`deadlok` → empty) — keyword V1 only; semantic search is V2
- Bookmark uniqueness is app-level (no DB unique index yet) — race possible under concurrency
- SQLite + in-memory rate limits — fine for local/demo; use Postgres + shared limiter for multi-instance production
- Role/status stored as strings (not DB enums)
- Email verification/reset uses console mail in local dev
- Web results intentionally not paginated (documented)

These do **not** block **RESUME READY** for a portfolio V1.

---

## Final V1 readiness

**RESUME READY**

Criteria met:
- [x] lint passes (0 errors)
- [x] unit tests pass
- [x] smoke tests pass
- [x] bookmark 500 fixed
- [x] search pagination works (community)
- [x] search click tracking protected
- [x] protected file access requires authentication
- [x] no intentional regressions to auth/upload/search/admin core flows

Do **not** start V2 AI until you choose to; V1 is stable enough to present.
