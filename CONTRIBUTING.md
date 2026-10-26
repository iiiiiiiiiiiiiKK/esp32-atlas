# Contributing to ESP32 Atlas

Thanks for helping. Two kinds of contributions matter here: **better data** and
**better code**. Both have a hard rule in common — never claim something you have
not verified.

## Ground rules

1. **No invented numbers.** Stars, forks, issues, push dates and releases must come
   from the GitHub API. Never type a metric by hand into content files.
2. **No invented freshness.** If a repository is dormant, say so (there is an
   `archived` flag and a maintenance note) rather than writing "actively
   maintained".
3. **No copied third-party prose.** Tutorial entries store a title, a one-line
   learning goal and the original link. Do not paste article bodies.
4. **Mark what you could not confirm.** Use `"待核验" / "unverified"` rather than
   guessing a spec.
5. **Every link must resolve.** Check with HTTP 200 before adding it.

## Adding or fixing a project

Editorial content lives in TypeScript, not in the database:

| File | Contents |
| --- | --- |
| `src/content/curation.ts` | category, chips, frameworks, difficulty, doc/demo scores, tags, bilingual summary |
| `src/content/guides.ts` | hand-written guide (prereqs, hardware, quick start, FAQ, limits, next steps) |
| `src/content/tutorials.ts` | tutorial hub entries |
| `src/content/paths.ts` | the 10 learning paths and their steps |
| `src/content/chips.ts` | chip reference table |
| `src/data/github-snapshot.json` | fetched GitHub metadata (do not hand-edit) |

Workflow:

```bash
# 1. add the repo to src/content/curation.ts
# 2. refresh real metrics (needs GITHUB_TOKEN, otherwise anonymous 60/h)
npm run fetch:github

# 3. regenerate SQL and apply it locally
npm run db:seed
npm run db:migrate:local

# 4. verify
npm test && npm run typecheck && npm run lint
```

`npm run db:seed` fails loudly if a curation entry has no matching GitHub snapshot,
which is exactly the guard that keeps metrics real.

## Adding a tutorial

1. Open the URL and confirm it returns 200.
2. Add an entry to `src/content/tutorials.ts` with `goal` in both languages.
3. If the source is new, mention it in the PR so it can be reviewed for quality.
4. `tests/content.test.ts` will reject non-https URLs, unknown repo references and
   missing bilingual goals.

## Code changes

- Pure logic belongs in `src/lib/` with a unit test in `tests/`.
- UI text must go through `src/lib/i18n.ts` (or a `*_i18n` content field) — no
  hard-coded Chinese or English strings in components.
- Run the full gate before opening a PR:

```bash
npm run typecheck && npm run lint && npm test && npm run build
npx playwright test        # requires a running server on :3100
```

## Reporting a data error

Include: the page URL, the field that is wrong, and a source link proving the
correct value. A screenshot is welcome but a link is required.

## Security issues

Please do not open a public issue for a vulnerability. Use the contact on
<https://x.com/0xkillcoin> and allow a reasonable window before disclosure.
