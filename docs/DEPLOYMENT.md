# Deployment — what was actually done

Target: Cloudflare Workers + D1, adapter `@opennextjs/cloudflare`.

Production URL: <https://esp32-atlas.changyuansex.workers.dev>
Worker name: `esp32-atlas` · D1 database: `esp32-atlas-db`

## 1. One-time setup

```bash
# authenticated wrangler (CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env)
npx wrangler d1 create esp32-atlas-db
#   → copy database_id into wrangler.jsonc → d1_databases[0].database_id

npx wrangler d1 migrations apply esp32-atlas-db --remote

npx wrangler secret put GITHUB_TOKEN   # server-side GitHub sync
npx wrangler secret put SYNC_TOKEN     # bearer token for scheduled sync

ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run admin:create -- --remote
```

## 2. Build and deploy

```bash
npx opennextjs-cloudflare build      # next build + worker bundling
npx opennextjs-cloudflare deploy     # uploads .open-next/worker.js + assets
```

`npm run deploy:cf` runs both in one step.

## 3. Environment / bindings in production

| Binding | Type | Notes |
| --- | --- | --- |
| `DB` | D1 database | `esp32-atlas-db` |
| `ASSETS` | Assets | `.open-next/assets` |
| `NEXTJS_ENV` | var | `production` |
| `GITHUB_TOKEN` | secret | never exposed to the browser |
| `SYNC_TOKEN` | secret | compared with constant-time `safeEqual` |

## 4. Scheduling the GitHub sync

Cloudflare's free plan allows **5 cron triggers per account**, and this account is
already at that limit (`code 10072` on deploy). So `wrangler.jsonc` intentionally
contains no `triggers` block.

Two working alternatives:

**A. Admin console** — sign in at `/admin`, press「立即同步 GitHub」. Verified
working: returns `{ ok: true, total, updated, failed }` and writes a `sync_jobs`
row.

**B. External scheduler** (GitHub Action, cron-job.org, another Worker):

```bash
curl -X POST https://esp32-atlas.changyuansex.workers.dev/api/admin/sync \
  -H "Authorization: Bearer $SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":30}'
```

To restore the native cron later, upgrade the account plan or free a slot, then add
back to `wrangler.jsonc`:

```jsonc
"triggers": { "crons": ["17 */6 * * *"] }
```

and redeploy.

## 5. Cache and revalidation

The app is fully dynamic and sets `cache-control: private, no-cache, no-store,
must-revalidate` on HTML, so editorial edits and sync results appear immediately.
There is no ISR cache to purge and therefore no stale-cache failure mode.

## 6. Post-deploy verification (actually performed)

```
GET /                       200
GET /explore                200
GET /projects/78-xiaozhi-esp32  200
GET /paths                  200
GET /paths/zero-to-esp32    200
GET /tutorials              200
GET /hardware               200
GET /radar                  200
GET /collections            200
GET /submit                 200
GET /admin                  200 (login form for anonymous visitors)
GET /about                  200
GET /robots.txt             200 (Disallow: /admin, /api/, /collections)
GET /sitemap.xml            200 (93 URLs)
GET /projects/does-not-exist   404
POST /api/admin/sync        → 401 unauthorized (anonymous)
POST /api/admin/submissions → 401 unauthorized (anonymous)
POST /api/submit (bad host) → 400 invalid-github-url
POST /api/submit (missing)  → 404 repo-not-found
```

Security headers observed on the production response: `permissions-policy`,
`referrer-policy`, `x-content-type-options`, `x-frame-options` (see
`docs/SECURITY.md`).

## 7. Cost notes (free tier reality check)

- Workers free: 100k requests/day, 10 ms CPU per request (this app is well under).
- D1 free: 5 GB storage, 5M row reads/day — the dataset is ~30 repos, ~46
  tutorials, ~30 guides.
- Cron triggers: capped at 5 **per account** on the free plan (the blocker above).
- No paid resource was created. No billing information was used.
