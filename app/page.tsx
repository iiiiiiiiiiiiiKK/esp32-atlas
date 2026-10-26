import Link from "next/link";
import { ArrowRight, Activity, Star, Sparkles, GraduationCap } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { corpusSummary } from "@/lib/queries";
import { getStarGrowth, lastSyncedAt, countSnapshots } from "@/lib/repos";
import { formatDate, relativeDays, formatNumber } from "@/lib/format";
import { activityBucket, recommendScore } from "@/lib/search";
import { RepoCard, categoryLabel, CATEGORY_LABELS } from "@/components/repo-card";
import { HeroSearch } from "@/components/hero-search";
import { EmptyState } from "@/components/empty-state";
import { listPaths } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lang = await getLang();
  const { repos, hot, active, beginners, fresh } = await corpusSummary();
  const [paths, syncedAt, snapshotStats, topRepo] = await Promise.all([
    listPaths(),
    lastSyncedAt(),
    countSnapshots(),
    Promise.resolve(repos[0] ?? null),
  ]);

  const now = Date.now();
  // "Trending" = recently pushed AND high editorial score. We never claim star
  // growth here because we may not have 7-day snapshots yet.
  const trending = [...hot]
    .map((r) => ({ repo: r, score: recommendScore(r, { now }).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.repo);

  const activeTop = [...active]
    .sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""))
    .slice(0, 6);
  const newTop = fresh.slice(0, 4);
  const beginnerTop = beginners.slice(0, 5);
  const growth7 = topRepo ? await getStarGrowth(topRepo.id, 7) : null;

  const stats = [
    { label: tr("statsRepos", lang), value: repos.length, icon: <Star size={13} aria-hidden /> },
    { label: tr("statsPaths", lang), value: paths.length, icon: <GraduationCap size={13} aria-hidden /> },
    {
      label: tr("radarSnapshots", lang),
      value: snapshotStats.snapshots,
      icon: <Activity size={13} aria-hidden />,
    },
    { label: tr("statsChips", lang), value: 7, icon: <Sparkles size={13} aria-hidden /> },
  ];

  return (
    <div className="space-y-8 sm:space-y-14">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-md border border-[var(--border)] bg-[var(--panel)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(560px 240px at 12% -10%, color-mix(in srgb, var(--brand) 20%, transparent), transparent 70%), radial-gradient(480px 220px at 88% 0%, color-mix(in srgb, var(--cyan) 16%, transparent), transparent 72%)",
          }}
        />
        <div className="relative grid gap-6 p-4 sm:gap-8 sm:p-9 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
          <div className="min-w-0">
            <span className="pill pill-brand mono uppercase tracking-[0.14em]">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              {tr("heroEyebrow", lang)}
            </span>
            <h1 className="mt-3 max-w-[19ch] text-[1.65rem] font-semibold leading-[1.18] tracking-tight sm:mt-4 sm:text-[2.5rem]">
              {tr("heroTitle", lang)}
            </h1>
            <p className="muted mt-2.5 max-w-[62ch] text-[0.88rem] leading-relaxed sm:mt-3 sm:text-[0.9rem]">
              {tr("heroBody", lang)}
            </p>
            <div className="mt-4 max-w-xl sm:mt-6">
              <HeroSearch lang={lang} />
            </div>
            {/* 2-up on phones so four figures never become four stacked rows. */}
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-6 sm:flex sm:flex-wrap sm:gap-x-6">
              {stats.map((s) => (
                <div key={s.label} className="min-w-0 sm:min-w-[6.5rem]">
                  <dt className="mono flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
                    {s.icon}
                    {s.label}
                  </dt>
                  <dd className="mono mt-0.5 text-lg font-semibold text-[var(--text)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Goal-based entry points — the core differentiator */}
          <div className="surface-2 min-w-0 self-start p-3 sm:p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[0.9rem] font-semibold">{tr("goalTitle", lang)}</h2>
              <span className="mono hidden text-[0.62rem] text-[var(--text-2)] sm:inline">{tr("goalSubtitle", lang)}</span>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-1 sm:mt-3 sm:grid-cols-1 sm:gap-1.5">
              {Object.entries(CATEGORY_LABELS)
                .filter(([slug]) => ["ai-voice", "smart-home", "display", "robotics", "led", "wireless"].includes(slug))
                .map(([slug, label]) => {
                  const count = repos.filter((r) => r.category === slug).length;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/explore?category=${slug}`}
                        className="flex items-center justify-between gap-1.5 rounded border border-[var(--border)] px-2 py-2 text-[0.85rem] transition-colors hover:border-[var(--brand-dim)] hover:bg-[var(--panel)] sm:border-transparent sm:py-1.5 sm:text-[0.82rem]"
                        data-testid={`goal-${slug}`}
                      >
                        <span className="truncate">{label[lang]}</span>
                        <span className="mono flex shrink-0 items-center gap-1 text-[0.7rem] text-[var(--text-2)]">
                          {count}
                          <ArrowRight size={11} aria-hidden />
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] bg-[var(--panel-2)] px-6 py-2">
          <span className="mono text-[0.64rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
            {tr("dataUpdated", lang)}: {formatDate(syncedAt, lang)} ({relativeDays(syncedAt, lang)})
          </span>
          <span className="mono text-[0.64rem] text-[var(--text-2)]">
            {tr("radarSnapshots", lang)}: {snapshotStats.snapshots}
          </span>
        </div>
      </section>

      {/* ---------- Trending ---------- */}
      <section aria-labelledby="trending-h" className="min-w-0">
        <SectionHead
          id="trending-h"
          title={tr("weeklyHot", lang)}
          hint={
            lang === "zh"
              ? "近期有提交 + 文案/文档质量综合排序，不是单纯比 Stars"
              : "Recently pushed, ranked by an explainable score — not raw stars"
          }
          href="/explore?sort=recommended"
          lang={lang}
        />
        {trending.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((repo) => (
              <RepoCard key={repo.id} repo={repo} lang={lang} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={lang === "zh" ? "本周没有新的提交记录" : "No pushes recorded this week"}
            body={
              lang === "zh"
                ? "同步任务每小时检查一次 GitHub。没有近期提交时，这里保持为空而不是编造趋势。"
                : "Sync runs hourly against GitHub. When nothing was pushed, this stays empty rather than inventing trends."
            }
            cta={{ href: "/explore", label: tr("navExplore", lang) }}
            lang={lang}
          />
        )}
      </section>

      {/* ---------- Radar teaser ---------- */}
      <section aria-labelledby="radar-h" className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface min-w-0 p-4 sm:p-5">
          <SectionHead id="radar-h" title={tr("radarTeaser", lang)} hint={tr("radarIntro", lang)} href="/radar" lang={lang} inline />
          <ul className="mt-2 divide-y divide-[var(--border)] sm:mt-4">
            {activeTop.slice(0, 4).map((repo) => (
              <li key={repo.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/projects/${repo.slug}`} className="min-w-0 truncate text-[0.82rem] hover:text-[var(--brand)]">
                  {repo.fullName}
                </Link>
                <span className="mono shrink-0 text-[0.68rem] text-[var(--text-2)]">
                  {relativeDays(repo.pushedAt, lang)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded border border-[var(--border)] bg-[var(--panel-2)] p-3">
            <div className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
              {tr("radarGrowthTitle", lang)} · 7d
            </div>
            {growth7 && topRepo ? (
              <p className="mt-1 text-[0.82rem]">
                <span className="font-semibold">{topRepo.fullName}</span>{" "}
                <span className="brand-text mono">+{formatNumber(growth7.delta, lang)}</span>{" "}
                <span className="muted mono text-[0.7rem]">
                  ({formatDate(growth7.fromCapturedAt, lang)} → {formatDate(growth7.toCapturedAt, lang)})
                </span>
              </p>
            ) : (
              <p className="muted mt-1 text-[0.78rem] leading-relaxed">{tr("radarAccumulating", lang)}</p>
            )}
          </div>
        </div>

        <div className="surface min-w-0 p-4 sm:p-5">
          <SectionHead
            id="paths-h"
            title={tr("pathsTeaser", lang)}
            hint={lang === "zh" ? "每条路线都有阶段、资源与完成标准" : "Every path has stages, resources and completion criteria"}
            href="/paths"
            lang={lang}
            inline
          />
          <ul className="mt-4 space-y-1.5">
            {paths.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/paths/${p.slug}`}
                  className="flex items-center justify-between gap-2 rounded border border-transparent px-2 py-1.5 text-[0.82rem] hover:border-[var(--border)] hover:bg-[var(--panel-2)]"
                >
                  <span className="truncate">{p.title[lang]}</span>
                  <span className="mono shrink-0 text-[0.66rem] text-[var(--text-2)]">
                    {p.steps.length} {tr("steps", lang)} · {p.hours}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Beginner / new ---------- */}
      <section aria-labelledby="beginner-h" className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionHead
            id="beginner-h"
            title={tr("beginnerPicks", lang)}
            hint={lang === "zh" ? "文档完整、开箱可用、难度标注为入门" : "Documented, works out of the box, marked beginner"}
            href="/explore?flag=beginner"
            lang={lang}
            inline
          />
          <ul className="surface mt-3 divide-y divide-[var(--border)]">
            {beginnerTop.map((repo) => (
              <li key={repo.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/projects/${repo.slug}`} className="block truncate text-[0.82rem] font-medium hover:text-[var(--brand)]">
                    {repo.fullName}
                  </Link>
                  <p className="muted truncate text-[0.72rem]">{repo.summary?.[lang] ?? repo.description}</p>
                </div>
                <span className="pill mono shrink-0">{formatNumber(repo.stars, lang)}★</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <SectionHead
            id="new-h"
            title={tr("newArrivals", lang)}
            hint={lang === "zh" ? "按首次收录时间排序" : "Ordered by first indexed at"}
            href="/explore?sort=new"
            lang={lang}
            inline
          />
          <ul className="surface mt-3 divide-y divide-[var(--border)]">
            {newTop.map((repo) => (
              <li key={repo.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/projects/${repo.slug}`} className="block truncate text-[0.82rem] font-medium hover:text-[var(--brand)]">
                    {repo.fullName}
                  </Link>
                  <p className="muted truncate text-[0.72rem]">
                    {repo.category ? categoryLabel(repo.category, lang) : "—"} ·{" "}
                    {activityBucket(repo.pushedAt) === "hot"
                      ? lang === "zh" ? "本周活跃" : "active this week"
                      : relativeDays(repo.pushedAt, lang)}
                  </p>
                </div>
                <span className="pill shrink-0">{repo.license ?? "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  id,
  title,
  hint,
  href,
  lang,
  inline = false,
}: {
  id: string;
  title: string;
  hint?: string;
  href: string;
  lang: "zh" | "en";
  inline?: boolean;
}) {
  return (
    <div className={`flex items-end justify-between gap-3 ${inline ? "" : "mb-2 sm:mb-3"}`}>
      <div className="min-w-0">
        <h2 id={id} className="text-[1.02rem] font-semibold tracking-tight">
          {title}
        </h2>
        {hint ? <p className="muted mt-0.5 max-w-[70ch] text-[0.75rem] leading-relaxed">{hint}</p> : null}
      </div>
      <Link
        href={href}
        className="mono inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap py-1 text-[0.72rem] text-[var(--cyan)] hover:underline"
      >
        {tr("viewAll", lang)} →
      </Link>
    </div>
  );
}
