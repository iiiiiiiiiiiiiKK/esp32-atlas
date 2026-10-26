# Security review — ESP32 Atlas

Date: 2026-10-26 · Scope: the deployed Worker (`esp32-atlas`), its D1 database, and
the admin surface. Reviewed against OWASP ASVS-style checkpoints relevant to a
small server-rendered catalogue.

## 1. Secrets and credentials

| Item | Handling | Status |
| --- | --- | --- |
| `GITHUB_TOKEN` | Cloudflare Worker **secret**, read only in `src/lib/sync.ts` and the submit route (server-side). Never bundled into client JS. | OK |
| `SYNC_TOKEN` | Worker secret, compared with a constant-time `safeEqual` against the `Authorization: Bearer` header. | OK |
| Admin passwords | PBKDF2-SHA256, 150 000 iterations, 16-byte random salt per user, stored as `pbkdf2$iter$salt$hash`. Plaintext is never written to disk, logs or the database. | OK |
| `.env` files | Only `.env.example` is committed (variable names + placeholders). `.env*` is in `.gitignore`. | OK |
| Repo hygiene | No token, key or personal path appears in source. `git grep` for `ghp_`, `cfat_`, `CFUT`, `cloudflare_api` returns nothing. | OK |

Rotation advice: the GitHub PAT used during setup should be rotated by the owner
after handover, because it was pasted into a chat transcript. Nothing in the
repository depends on that specific token.

## 2. Authentication and authorization

- Admin sessions: 32 random bytes → base64url, stored in D1 with an 8-hour
  expiry, delivered in an `HttpOnly; SameSite=Lax; Secure` cookie. No JWT, so a
  deleted session is immediately invalid.
- Every admin page (`/admin`) and both admin APIs (`/api/admin/sync`,
  `/api/admin/submissions`) call `getCurrentAdmin()` server-side. Verified in
  production: anonymous `POST /api/admin/sync` and
  `POST /api/admin/submissions` both return **401**.
- Login failures are uniform (`invalid-credentials`) and always run one PBKDF2
  derive, so timing and message content do not reveal whether an account exists.
- Login attempts are throttled per IP inside the isolate (8 per 10 minutes).
  This is a speed bump; the durable cost is the 150k-iteration PBKDF2 itself.
- There is **no** sign-up route anywhere in the app; admin rows can only be
  created by `scripts/create-admin.ts` with database access.

## 3. Input validation and SSRF

- Submissions accept **only** `https://github.com/<owner>/<repo>` (Zod regex).
  Anything else — `http://`, other hosts, `user:pass@`, subpaths, `javascript:`,
  `data:` — is rejected before any network call. Verified by unit tests and by a
  live request returning `400 invalid-github-url`.
- Outbound requests are always to a hard-coded `https://api.github.com/repos/...`
  prefix built from the validated owner/repo pair; no user-supplied URL is ever
  fetched. This is the SSRF control.
- All SQL uses `?` placeholders with a normalising binder; there is no string
  concatenation of user input into queries.
- Search queries are capped at 120 characters, facets at 20 values, page at 50.

## 4. Abuse controls

- Submission rate limit: 5 per IP per 30-minute window, stored in D1 and keyed by
  a **SHA-256 hash** of the IP (truncated), so raw IPs are never persisted.
- Submissions land in `project_submissions` with `status='pending'` and can never
  reach a listing without an admin approval.
- Duplicate submissions (already-listed or already-pending) are rejected with a
  specific message instead of a fake success.
- GitHub sync respects the API budget: it stops when `x-ratelimit-remaining <= 1`
  and records the reason in `sync_jobs.message`.

## 5. Injection, XSS and content safety

- React escapes all interpolated text; no `dangerouslySetInnerHTML` exists in the
  codebase (checked with grep).
- Third-party README/Markdown is **never rendered**. Guides store our own short
  editorial text plus links only, which removes the entire class of
  markdown-based injection.
- All external links are rendered with `rel="noopener noreferrer nofollow"` and
  `target="_blank"`.
- Security headers are set for every route: `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
  and a restrictive `Permissions-Policy`. Verified in the production response.

## 6. Data integrity and availability

- Page renders read only from D1; GitHub is contacted solely by the sync worker.
  A GitHub outage therefore cannot take the site down.
- A failed sync keeps the previous metrics and flips `sync_status` to `stale`,
  which the UI surfaces instead of silently showing old numbers as current.
- Deleting/archiving detection: a 404 from GitHub marks the row stale and never
  deletes it.
- Growth figures are computed only from `repository_snapshots`; without history
  the UI prints "accumulating" rather than a fabricated number.

## 7. Privacy

- No analytics, no cookies beyond `atlas_lang`, `atlas_theme` and the admin
  session cookie.
- Collections live in `localStorage` only; nothing is uploaded.
- Submitter IPs are stored as SHA-256 hashes for rate limiting only.

## 8. Known gaps (disclosed, not hidden)

1. The login throttle is per-isolate in memory, so a distributed brute-force
   across many colos would only face the PBKDF2 cost. A D1-backed counter would
   be the next hardening step.
2. There is no CSRF token on the admin forms. The session cookie is
   `SameSite=Lax`, which blocks cross-site POSTs from forms in modern browsers,
   but an explicit double-submit token would be stronger.
3. Dependency audit: `npm audit` currently reports advisories in dev-only
   transitive packages; none are shipped in the Worker bundle. Reviewed but not
   force-upgraded, to avoid breaking the pinned Next.js build.
4. Cloudflare's free plan caps cron triggers at 5 per account; this account is
   already at the limit, so the scheduled GitHub sync is **not** enabled. Manual
   sync from the admin console works, as does a `POST /api/admin/sync` call with
   the `SYNC_TOKEN` bearer (e.g. from an external scheduler or GitHub Action).
