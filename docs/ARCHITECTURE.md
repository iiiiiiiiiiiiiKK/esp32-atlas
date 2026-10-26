# Architecture

## Request path

```
Browser
  │  (HTML/RSC, no client-side data fetching for catalogue data)
  ▼
Cloudflare Worker  ──  @opennextjs/cloudflare adapter, nodejs_compat
  │
  ├─ Server Components (app/**/page.tsx)  →  src/lib/repos.ts  →  D1 (binding `DB`)
  │     · every page is dynamic; nothing is pre-rendered with stale data
  │     · if D1 fails, error.tsx renders a real retry UI, not a blank page
  │
  ├─ Route Handlers
  │     · POST /api/submit              → validates, checks GitHub, queues review
  │     · POST /api/auth/login|DELETE   → creates/destroys a D1 session
  │     · POST /api/admin/submissions   → approve/reject (admin only)
  │     · POST /api/admin/sync          → runs the sync engine (admin or cron bearer)
  │
  └─ Assets (binding `ASSETS`) → .open-next/assets
```

Outbound network calls to GitHub happen **only**:

1. in `src/lib/sync.ts`, on an admin-triggered or scheduled sync;
2. in `POST /api/submit`, to verify that a submitted repository exists.

Both construct the URL from a validated `owner/repo` pair; no user input is ever
used as a URL.

## Storage model

```
repositories ──1:1── project_guides          (editorial guide JSON)
     │
     ├──1:N── repository_snapshots           (stars/forks/issues over time)
     ├──N:M── tags (via repository_tags)
     └───────curation_status: published | pending | rejected

tutorials ── related_repos[] ── references repositories.full_name (not an FK,
                                 because a tutorial may outlive a delisting)

learning_paths ──1:N── learning_path_steps
chips                    (standalone reference table)
project_submissions      (review queue; never joined into listings)
admin_users, sessions    (auth)
sync_jobs                (observability for the sync engine)
submit_rate_limit        (hashed IP buckets)
```

### Why editorial JSON lives in its own table

`project_guides.content` is a JSON document, and all curated judgement fields sit
either in `project_guides` or in columns the sync statement never touches
(`category`, `difficulty`, `doc_score`, `demo_score`, `beginner_friendly`,
`featured`, `summary_i18n`, `chips`, `frameworks`, `tags`). This is enforced by
*construction*: the `UPDATE` in `src/lib/sync.ts` simply does not mention them.

## i18n

All strings live in `src/lib/i18n.ts` as `{zh, en}` pairs; content records store
`*_i18n` JSON columns with the same shape. `t(text, lang)` picks the language with
a deterministic fallback. The current language comes from a cookie read on the
server, so the first paint is already correct (no flash of the wrong language, no
client-side hydration mismatch).

## Why D1 and not Postgres

The whole dataset is a few hundred rows of curated content plus append-only
snapshots. D1 gives ACID SQL, a free tier, and zero network hops from the Worker.
Postgres would add a connection-pooling failure mode and a paid dependency for no
modelling benefit. The driver layer (`src/lib/db/driver.ts`) is a three-method
interface, so migrating later means writing one more adapter.

## Rendering strategy

Everything is dynamic (`export const dynamic = "force-dynamic"`). Rationale: the
site is a live catalogue whose value depends on freshness; a stale ISR cache would
undermine the "synced at" timestamps that the product promises. Static
prerendering is limited to `robots.txt` and `sitemap.xml` metadata routes.

## Failure behaviour

| Failure | Behaviour |
| --- | --- |
| GitHub rate limit | Sync stops early, records the reason in `sync_jobs.message`, rows keep old data |
| Repo deleted / renamed | `sync_status='stale'`, page shows a stale warning, data retained |
| D1 unavailable | `app/error.tsx` renders a retry + home link |
| Unknown project slug | `notFound()` → `app/not-found.tsx` with HTTP 404 |
| Invalid submission | Specific error code per cause (`invalid-github-url`, `repo-not-found`, `duplicate`, `rate-limited`) |
