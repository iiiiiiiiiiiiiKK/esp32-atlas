# Ranking — how "recommended" actually works

`src/lib/search.ts#recommendScore` is the single implementation; `tests/search.test.ts`
locks the behaviour. This document exists because a recommendation score that
nobody can explain is indistinguishable from a popularity contest.

## Score components

| Component | Max points | Rule |
| --- | --- | --- |
| Recency | 30 | pushed ≤7d → 30; ≤30d → 24; ≤90d → 16; ≤365d → 8; older → 0 |
| Popularity | 25 | `min(25, log10(stars) × 6)` — logarithmic, hard-capped |
| Documentation | 12 | `doc_score / 100 × 12` (editorial 0–100) |
| Demo usability | 8 | `demo_score / 100 × 8` (editorial 0–100) |
| Beginner fit | 8 | +8 if the editor marked it beginner friendly |
| Difficulty bonus | 4 | +4 when difficulty is `beginner` |
| Recent release | 6 | release within 180 days |
| Editorial pick | 6 | curator pinned it as representative |
| Keyword hits | 14 each | one hit per matched query term |
| Goal match | +18 / −6 | +18 when the category equals the chosen goal, −6 otherwise |
| Archived penalty | −30 | archived repositories sink but stay visible |
| Stale penalty | −4 | last sync failed, so the metrics may be out of date |

## Why these shapes

- **Stars are capped.** Without a cap, a 30k-star repo beats a well-documented
  800-star repo on every query, which is exactly the failure mode this product
  exists to fix. The `tests/search.test.ts` assertion
  `huge.score - small.score <= 25` enforces it.
- **Recency outweighs popularity.** A maintained 400-star project is usually a
  better starting point than an abandoned 20k-star one.
- **Editorial signals are bounded.** Documentation, demo and beginner fit
  together can add at most 28 points, so curation nudges the order without
  overriding evidence.
- **Nothing hides.** An archived repo loses 30 points but is still listed, and
  the UI labels it `已归档 / Archived`.

## What the UI shows the user

Each card in `/explore` prints up to three human-readable reasons
(`近期活跃`, `文档完整`, `适合新手`, `命中关键词`, …) derived from the same
function, so the ordering is explainable on the page rather than hidden in code.

## Alternatives offered

Sorting is switchable to plain **Stars**, **Recently pushed**, **Newest** or
**Forks**. The default is "recommended", never the only option.

## Not implemented (deliberately)

No semantic/vector search, no LLM re-ranking, no per-user personalisation. All
three would be unverifiable at this data volume, and a black-box ranking would
contradict the provenance rules in the README.
