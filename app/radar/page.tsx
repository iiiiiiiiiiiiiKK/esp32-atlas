import Link from "next/link";
import type { Metadata } from "next";
import { TrendingUp, Clock, Tag, AlertTriangle, Activity } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { DataStatusBanner } from "@/components/data-status-banner";
import { tr } from "@/lib/i18n";
import { listRepos, countSnapshots, getSyncJobs } from "@/lib/repos";
import { daysSince, recommendScore } from "@/lib/search";
import { formatDate, formatNumber, relativeDays } from "@/lib/format";
import { RepoCard } from "@/components/repo-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "开源趋势雷达",
  description: "区分总 Stars、近期提交、版本发布与 Issue 活跃度；星标增长只在积累了历史快照后显示。",
  alternates: { canonical: "/radar" },
};

export default async function RadarPage() {
  const lang = await getLang();
  const [repos, snapshotStats, jobs] = await Promise.all([listRepos(1000), countSnapshots(), getSyncJobs(5)]);
  const now = Date.now();

  const recentReleases = repos
    .filter((r) => r.latestReleaseAt && daysSince(r.latestReleaseAt, now) <= 180)
    .sort((a, b) => (b.latestReleaseAt ?? "").localeCompare(a.latestReleaseAt ?? ""))
    .slice(0, 6);

  const activeLowStars = repos
    .filter((r) => daysSince(r.pushedAt, now) <= 60 && r.stars < 3000)
    .sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""))
    .slice(0, 6);

  const issueHeavy = [...repos]
    .filter((r) => r.openIssues > 0)
    .sort((a, b) => b.openIssues / Math.max(b.stars, 1) - a.openIssues / Math.max(a.stars, 1))
    .slice(0, 6);

  const newcomers = [...repos]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6);

  const topByScore = [...repos]
    .map((r) => ({ r, s: recommendScore(r, { now }).score }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => x.r);

  return (
    <div className="space-y-4">
      <DataStatusBanner lang={lang} />
      <header className="surface p-5">
        <h1 className="text-xl font-semibold tracking-tight">{tr("radarTitle", lang)}</h1>
        <p className="muted mt-1.5 max-w-[82ch] text-[0.85rem] leading-relaxed">{tr("radarIntro", lang)}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Stat label={tr("radarSnapshots", lang)} value={String(snapshotStats.snapshots)} />
          <Stat label={lang === "zh" ? "有快照的仓库" : "Repos with snapshots"} value={String(snapshotStats.repos)} />
          <Stat
            label={lang === "zh" ? "最早快照" : "Earliest snapshot"}
            value={snapshotStats.earliest ? formatDate(snapshotStats.earliest, lang) : "—"}
          />
        </div>
        <div className="mt-3 rounded border border-[var(--border)] bg-[var(--panel-2)] p-3">
          <p className="mono flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--warn)]">
            <AlertTriangle size={10} aria-hidden /> {tr("radarGrowthTitle", lang)}
          </p>
          <p className="muted mt-1 text-[0.79rem] leading-relaxed">{tr("radarAccumulating", lang)}</p>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title={tr("weeklyHot", lang)} icon={<TrendingUp size={12} aria-hidden />} hint={lang === "zh" ? "综合推荐分（活跃度 + 文档 + 新手友好）" : "Composite score: activity + docs + beginner fit"}>
          <div className="grid gap-2 sm:grid-cols-2">
            {topByScore.map((r) => (
              <RepoCard key={r.id} repo={r} lang={lang} compact />
            ))}
          </div>
        </Panel>

        <Panel title={tr("radarReleases", lang)} icon={<Tag size={12} aria-hidden />} hint={lang === "zh" ? "180 天内有版本发布" : "Released within 180 days"}>
          <ul className="divide-y divide-[var(--border)]">
            {recentReleases.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <Link href={`/projects/${r.slug}`} className="block truncate text-[0.82rem] hover:text-[var(--brand)]">
                    {r.fullName}
                  </Link>
                  <span className="mono text-[0.64rem] text-[var(--text-2)]">
                    {formatDate(r.latestReleaseAt, lang)} · {relativeDays(r.latestReleaseAt, lang)}
                  </span>
                </div>
                <span className="pill pill-brand mono shrink-0">{r.latestReleaseTag}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={tr("radarHidden", lang)} icon={<Activity size={12} aria-hidden />} hint={lang === "zh" ? "60 天内有提交且 Stars < 3000" : "Pushed within 60 days, under 3k stars"}>
          <ul className="divide-y divide-[var(--border)]">
            {activeLowStars.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/projects/${r.slug}`} className="min-w-0 truncate text-[0.82rem] hover:text-[var(--brand)]">
                  {r.fullName}
                </Link>
                <span className="mono shrink-0 text-[0.66rem] text-[var(--text-2)]">
                  {formatNumber(r.stars, lang)}★ · {relativeDays(r.pushedAt, lang)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={tr("radarIssues", lang)} icon={<Clock size={12} aria-hidden />} hint={lang === "zh" ? "Open Issues / Stars 比值高，说明讨论活跃但积压也多" : "High open-issues-to-stars ratio: busy discussion, real backlog"}>
          <ul className="divide-y divide-[var(--border)]">
            {issueHeavy.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/projects/${r.slug}`} className="min-w-0 truncate text-[0.82rem] hover:text-[var(--brand)]">
                  {r.fullName}
                </Link>
                <span className="mono shrink-0 text-[0.66rem] text-[var(--text-2)]">
                  {formatNumber(r.openIssues, lang)} / {formatNumber(r.stars, lang)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title={tr("radarRising", lang)} icon={<TrendingUp size={12} aria-hidden />} hint={lang === "zh" ? "按 GitHub 创建时间排序，不代表本周新增星标" : "Ordered by repository creation date — not star growth"}>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {newcomers.map((r) => (
            <li key={r.id} className="min-w-0">
              <Link href={`/projects/${r.slug}`} className="flex min-w-0 items-center justify-between gap-2 rounded border border-[var(--border)] px-2.5 py-2 text-[0.8rem] hover:border-[var(--brand-dim)] hover:bg-[var(--panel-2)]">
                <span className="min-w-0 truncate">{r.fullName}</span>
                <span className="mono shrink-0 text-[0.64rem] text-[var(--text-2)]">{formatDate(r.createdAt, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={tr("syncStatus", lang)} icon={<Activity size={12} aria-hidden />} hint={lang === "zh" ? "同步任务记录（保存在数据库，页面从不阻塞等待 GitHub）" : "Sync job history, stored in the database. Requests never block on GitHub."}>
        {jobs.length === 0 ? (
          <p className="muted text-[0.8rem]">
            {lang === "zh" ? "还没有同步任务记录。" : "No sync jobs recorded yet."}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {jobs.map((job) => (
              <li key={String(job.id)} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[0.76rem]">
                <span className="mono text-[var(--text-2)]">{formatDate(String(job.started_at), lang)}</span>
                <span className="pill">{String(job.trigger)}</span>
                <span className={`pill ${job.status === "ok" ? "pill-brand" : job.status === "failed" ? "pill-danger" : "pill-warn"}`}>
                  {String(job.status)}
                </span>
                <span className="mono text-[0.68rem] text-[var(--text-2)]">
                  {String(job.updated ?? 0)}/{String(job.total ?? 0)} updated · {String(job.failed ?? 0)} failed
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-2 px-3 py-2">
      <div className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">{label}</div>
      <div className="mono mt-0.5 text-[0.95rem] font-semibold">{value}</div>
    </div>
  );
}

function Panel({
  title,
  icon,
  hint,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface min-w-0 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="mono flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
          {icon}
          {title}
        </h2>
      </div>
      {hint ? <p className="muted mt-0.5 text-[0.7rem] leading-relaxed">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}
