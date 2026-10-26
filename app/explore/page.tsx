import Link from "next/link";
import type { Metadata } from "next";
import { getLang } from "@/lib/prefs";
import { DataStatusBanner } from "@/components/data-status-banner";
import { tr } from "@/lib/i18n";
import { explore } from "@/lib/queries";
import { RepoCard } from "@/components/repo-card";
import { EmptyState } from "@/components/empty-state";
import { ExploreFiltersPanel } from "@/components/explore-filters";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";
import { FilterSearch } from "@/components/filter-search";
import { activeFilterCount, parseFilters, filtersToQuery } from "@/lib/search";
import { lastSyncedAt, listRepos } from "@/lib/repos";
import { formatDate } from "@/lib/format";
import { X } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "探索 ESP32 项目",
  description: "按类别、芯片、框架、难度与活跃度筛选 ESP32 开源项目，所有指标来自 GitHub API。",
  alternates: { canonical: "/explore" },
};

const SORTS = [
  { key: "recommended", labelZh: "综合推荐", labelEn: "Recommended" },
  { key: "stars", labelZh: "Stars", labelEn: "Stars" },
  { key: "updated", labelZh: "最近更新", labelEn: "Recently pushed" },
  { key: "new", labelZh: "最近新增", labelEn: "Newest" },
  { key: "forks", labelZh: "Forks", labelEn: "Forks" },
] as const;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = await getLang();
  const filters = parseFilters(params);
  const [result, corpus, syncedAt] = await Promise.all([
    explore(params),
    listRepos(1000),
    lastSyncedAt(),
  ]);

  const languages = [...new Set(corpus.map((r) => r.language).filter((l): l is string => !!l))].sort();
  const licenses = [...new Set(corpus.map((r) => r.license).filter((l): l is string => !!l))].sort();
  const count = activeFilterCount(filters);

  const baseParams: Record<string, string | string[] | undefined> = { ...params };
  delete baseParams.page;

  function sortHref(sortKey: string) {
    const sp = new URLSearchParams(filtersToQuery({ ...filters, sort: sortKey as never, page: 1 }));
    const qs = sp.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  function pageHref(page: number) {
    const sp = new URLSearchParams(filtersToQuery({ ...filters, page }));
    const qs = sp.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  const panel = (
    <ExploreFiltersPanel lang={lang} base={baseParams} options={{ languages, licenses }} activeCount={count} />
  );

  return (
    <div className="space-y-3">
      <DataStatusBanner lang={lang} />
      {/* ---------- Page head ---------- */}
      <header className="surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{tr("navExplore", lang)}</h1>
          <p className="mono text-[0.68rem] text-[var(--text-2)]">
            {result.total} {tr("resultsCount", lang)} · {tr("dataUpdated", lang)} {formatDate(syncedAt, lang)}
          </p>
        </div>
        <p className="muted mt-1 max-w-[70ch] text-[0.82rem] leading-relaxed">
          {lang === "zh"
            ? "按目标、芯片、框架与活跃度筛选。URL 会保存全部筛选条件，可以直接分享给朋友。"
            : "Filter by goal, chip, framework and activity. The URL holds the whole filter state, so you can share it as-is."}
        </p>
        <div className="mt-3">
          <FilterSearch lang={lang} base={baseParams} initialQuery={filters.q} />
        </div>
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[248px_1fr]">
        {/* Facet panel: desktop column. On a phone it lives in the bottom sheet. */}
        <div className="hidden min-w-0 lg:block">{panel}</div>

        <div className="min-w-0 space-y-3">
          {/*
            Sticky toolbar. On mobile this is the only chrome between the user and
            the results: result count + filter sheet trigger + horizontally
            scrolling sort rail.
          */}
          <div className="sticky top-14 z-30 -mx-4 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded lg:border lg:px-2 lg:py-2">
            <div className="flex items-center gap-1.5">
              <MobileFilterSheet lang={lang} activeCount={count} resultCount={result.total}>
                {panel}
              </MobileFilterSheet>

              <div className="rail flex-1 items-center gap-1.5 lg:flex-wrap">
                <span className="mono hidden shrink-0 px-1 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)] lg:inline">
                  {tr("sortBy", lang)}
                </span>
                {SORTS.map((s) => (
                  <Link
                    key={s.key}
                    href={sortHref(s.key)}
                    aria-current={filters.sort === s.key ? "true" : undefined}
                    className={`btn btn-sm ${filters.sort === s.key ? "btn-primary" : "btn-ghost"}`}
                    data-testid={`sort-${s.key}`}
                    scroll={false}
                  >
                    {lang === "zh" ? s.labelZh : s.labelEn}
                  </Link>
                ))}
              </div>

              {count > 0 ? (
                <Link href="/explore" className="btn btn-sm btn-ghost shrink-0 px-2" aria-label={tr("clearFilters", lang)}>
                  <X size={13} aria-hidden />
                  <span className="mono text-[0.72rem]">{count}</span>
                </Link>
              ) : null}
            </div>
          </div>

          {result.items.length === 0 ? (
            <EmptyState
              title={tr("noResultsTitle", lang)}
              body={tr("noResultsBody", lang)}
              cta={{ href: "/explore", label: tr("clearFilters", lang) }}
              lang={lang}
              testId="explore-empty"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" data-testid="explore-grid">
              {result.items.map((repo) => (
                <RepoCard key={repo.id} repo={repo} lang={lang} reasons={result.reasons.get(repo.id)} />
              ))}
            </div>
          )}

          {result.totalPages > 1 ? (
            <nav className="rail justify-center gap-1 pt-2" aria-label="pagination">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  aria-current={p === result.page ? "page" : undefined}
                  className={`btn btn-sm mono ${p === result.page ? "btn-primary" : "btn-ghost"}`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
