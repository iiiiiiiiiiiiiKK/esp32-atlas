import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  GitFork,
  CircleDot,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Wrench,
  Cpu,
  ListChecks,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { formatDate, formatNumber, relativeDays } from "@/lib/format";
import { getRepoBySlug, getGuide, getSnapshots, getStarGrowth, listRepos, listTutorials, listChips } from "@/lib/repos";
import { CoverArt } from "@/components/cover-art";
import { SaveButton } from "@/components/save-button";
import { RepoCard, DifficultyPill, ActivityDot, categoryLabel } from "@/components/repo-card";
import { recommendScore } from "@/lib/search";
import type { GuideContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepoBySlug(slug);
  if (!repo) return { title: "Not found" };
  const description = repo.summary?.zh ?? repo.description ?? "";
  return {
    title: `${repo.fullName} — ESP32 项目`,
    description: description.slice(0, 160),
    alternates: { canonical: `/projects/${repo.slug}` },
    openGraph: {
      title: `${repo.fullName} · ESP32 Atlas`,
      description: description.slice(0, 200),
      url: `/projects/${repo.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const repo = await getRepoBySlug(slug);
  if (!repo) notFound();

  const [guide, snapshots, growth7, growth30, corpus, tutorials, chips] = await Promise.all([
    getGuide(repo.id),
    getSnapshots(repo.id, 180),
    getStarGrowth(repo.id, 7),
    getStarGrowth(repo.id, 30),
    listRepos(1000),
    listTutorials(),
    listChips(),
  ]);

  const related = corpus
    .filter((r) => r.id !== repo.id && (r.category === repo.category || r.chips.some((c) => repo.chips.includes(c))))
    .map((r) => ({ r, score: recommendScore(r).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.r);

  const repoPath = `/projects/${repo.slug}`;
  const repoName = repo.fullName.split("/")[1];
  const repoTutorials = tutorials.filter((t) => t.relatedRepos.includes(repo.fullName));
  const chipInfo = chips.filter((c) => repo.chips.includes(c.slug));
  const content: GuideContent | null = guide?.content ?? null;
  const confidence = guide?.confidence ?? "unverified";

  return (
    <div className="space-y-4">
      <Link href="/explore" className="btn btn-ghost btn-sm -ml-1">
        <ArrowLeft size={13} aria-hidden /> {tr("navExplore", lang)}
      </Link>

      {/* ---------- Header ---------- */}
      <header className="surface overflow-hidden">
        <div className="relative h-32 border-b border-[var(--border)] sm:h-40">
          <CoverArt repo={repo} className="h-full w-full" showLabel={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] to-transparent" />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mono flex flex-wrap items-center gap-1.5 text-[0.7rem] text-[var(--text-2)]">
                <span>{repo.owner}</span>
                <span>/</span>
                <span className="text-[var(--text)]">{repoName}</span>
                {repo.archived ? <span className="pill pill-danger ml-1">{lang === "zh" ? "已归档" : "Archived"}</span> : null}
                {repo.syncStatus !== "ok" ? (
                  <span className="pill pill-warn ml-1">
                    <AlertTriangle size={9} aria-hidden /> {tr("staleData", lang)}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-1 text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-[1.9rem]">
                {repoName}
              </h1>
              <p className="muted mt-2 max-w-[75ch] text-[0.86rem] leading-relaxed">
                {repo.summary?.[lang] ?? repo.description ?? "—"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <SaveButton
                id={`repo:${repo.slug}`}
                kind="repo"
                title={repo.fullName}
                href={repoPath}
                subtitle={(repo.summary?.[lang] ?? "").slice(0, 120)}
                lang={lang}
              />
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-primary">
                <ExternalLink size={13} aria-hidden /> {tr("viewRepo", lang)}
              </a>
            </div>
          </div>

          {/* metric strip — all values from GitHub API with a sync timestamp */}
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-6">
            <Metric icon={<Star size={11} aria-hidden />} label={tr("stars", lang)} value={formatNumber(repo.stars, lang)} />
            <Metric icon={<GitFork size={11} aria-hidden />} label={tr("forks", lang)} value={formatNumber(repo.forks, lang)} />
            <Metric icon={<CircleDot size={11} aria-hidden />} label={tr("openIssues", lang)} value={formatNumber(repo.openIssues, lang)} />
            <Metric icon={<Clock size={11} aria-hidden />} label={tr("pushedAt", lang)} value={relativeDays(repo.pushedAt, lang)} />
            <Metric
              icon={<TrendingUp size={11} aria-hidden />}
              label={tr("release", lang)}
              value={repo.latestReleaseTag ?? "—"}
              sub={repo.latestReleaseAt ? formatDate(repo.latestReleaseAt, lang) : undefined}
            />
            <Metric icon={<ShieldCheck size={11} aria-hidden />} label={tr("licenseLabel", lang)} value={repo.license ?? "—"} />
          </dl>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="mono text-[0.66rem] text-[var(--text-2)]">
              {tr("syncedAt", lang)}: {formatDate(repo.lastSyncedAt, lang)} · {tr("dataSource", lang)}: GitHub REST API
            </span>
            <ActivityDot pushedAt={repo.pushedAt} lang={lang} />
            {repo.latestReleaseUrl ? (
              <a href={repo.latestReleaseUrl} target="_blank" rel="noopener noreferrer nofollow" className="mono text-[0.66rem] text-[var(--cyan)] hover:underline">
                release ↗
              </a>
            ) : null}
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            <DifficultyPill level={repo.difficulty} lang={lang} />
            {repo.category ? <span className="pill">{categoryLabel(repo.category, lang)}</span> : null}
            {repo.frameworks.map((f) => (
              <span key={f} className="pill pill-cyan mono">
                {f}
              </span>
            ))}
            {repo.chips.map((c) => (
              <span key={c} className="pill mono">
                {c.toUpperCase()}
              </span>
            ))}
            {repo.tags.map((tag) => (
              <span key={tag} className="pill">
                #{tag}
              </span>
            ))}
          </ul>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
        <div className="min-w-0 space-y-4">
          {content ? (
            <>
              <Card title={tr("guideTitle", lang)} icon={<BookOpen size={13} aria-hidden />}>
                <p className="text-[0.85rem] leading-relaxed">{content.intro[lang]}</p>
                {confidence === "unverified" || content.confidenceNote ? (
                  <p className="pill pill-warn mt-2">
                    <AlertTriangle size={9} aria-hidden /> {tr("toVerify", lang)}
                  </p>
                ) : null}
                {content.confidenceNote ? (
                  <p className="muted mt-2 text-[0.75rem] leading-relaxed">{content.confidenceNote[lang]}</p>
                ) : null}
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card title={tr("prerequisites", lang)} icon={<ListChecks size={13} aria-hidden />}>
                  <ul className="space-y-1.5">
                    {content.prerequisites.map((p, i) => (
                      <li key={i} className="flex gap-2 text-[0.8rem] leading-relaxed">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 cyan-text" aria-hidden />
                        {p[lang]}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title={tr("hardwareList", lang)} icon={<Cpu size={13} aria-hidden />}>
                  <ul className="space-y-1.5">
                    {content.hardware.map((h, i) => (
                      <li key={i} className="text-[0.8rem] leading-relaxed">
                        <span>{h.item[lang]}</span>
                        {h.note ? <span className="muted block text-[0.72rem]">{h.note[lang]}</span> : null}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card title={tr("quickStart", lang)} icon={<Wrench size={13} aria-hidden />}>
                <ol className="space-y-3">
                  {content.quickStart.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mono mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-[var(--border-strong)] text-[0.66rem] text-[var(--brand)]">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-[0.83rem] font-medium">{step.step[lang]}</div>
                        <div className="muted text-[0.78rem] leading-relaxed">{step.detail[lang]}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              {content.faq.length > 0 ? (
                <Card title={tr("faq", lang)} icon={<HelpCircle size={13} aria-hidden />}>
                  <dl className="divide-y divide-[var(--border)]">
                    {content.faq.map((item, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0">
                        <dt className="text-[0.83rem] font-medium">{item.q[lang]}</dt>
                        <dd className="muted mt-0.5 text-[0.79rem] leading-relaxed">{item.a[lang]}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card title={tr("limitations", lang)} icon={<AlertTriangle size={13} aria-hidden />}>
                  <ul className="space-y-1.5">
                    {content.limitations.map((l, i) => (
                      <li key={i} className="text-[0.79rem] leading-relaxed text-[var(--text-2)]">
                        • {l[lang]}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title={tr("nextSteps", lang)} icon={<TrendingUp size={13} aria-hidden />}>
                  <ul className="space-y-1.5">
                    {content.nextSteps.map((l, i) => (
                      <li key={i} className="text-[0.79rem] leading-relaxed">
                        → {l[lang]}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </>
          ) : (
            <Card title={tr("guideTitle", lang)} icon={<BookOpen size={13} aria-hidden />}>
              <p className="muted text-[0.82rem] leading-relaxed">
                {lang === "zh"
                  ? "这个项目还没有人工整理的指南。我们不会为了填满页面而生成未经核验的步骤——请直接查看上游 README 与文档。"
                  : "No hand-written guide for this project yet. Rather than generate unverified steps to fill space, use the upstream README and docs."}
              </p>
            </Card>
          )}

          {content && content.docs.length > 0 ? (
            <Card title={tr("docsAndLinks", lang)} icon={<ExternalLink size={13} aria-hidden />}>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {content.docs.map((doc, i) => (
                  <li key={i}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center justify-between gap-2 rounded border border-[var(--border)] px-2.5 py-2 text-[0.8rem] transition-colors hover:border-[var(--brand-dim)] hover:bg-[var(--panel-2)]"
                    >
                      <span className="truncate">{doc.label[lang]}</span>
                      <span className="pill shrink-0">{doc.kind}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {repoTutorials.length > 0 ? (
            <Card title={tr("tutorialsTitle", lang)} icon={<BookOpen size={13} aria-hidden />}>
              <ul className="divide-y divide-[var(--border)]">
                {repoTutorials.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-2 first:pt-0">
                    <div className="min-w-0">
                      <a href={t.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[0.82rem] hover:text-[var(--brand)]">
                        {t.title[lang]}
                      </a>
                      <div className="mono text-[0.66rem] text-[var(--text-2)]">
                        {t.source} · {t.lang.toUpperCase()} · {tr("lastVerified", lang)} {t.verifiedAt}
                      </div>
                    </div>
                    <span className="pill shrink-0">{t.difficulty}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="min-w-0 space-y-4">
          <Card title={tr("radarGrowthTitle", lang)} icon={<TrendingUp size={13} aria-hidden />}>
            {growth7 || growth30 ? (
              <ul className="space-y-2">
                {[
                  { label: "7d", data: growth7 },
                  { label: "30d", data: growth30 },
                ].map(({ label, data }) => (
                  <li key={label} className="flex items-center justify-between text-[0.8rem]">
                    <span className="mono text-[var(--text-2)]">{label}</span>
                    {data ? (
                      <span className="mono">
                        <span className={data.delta >= 0 ? "brand-text" : "text-[var(--danger)]"}>
                          {data.delta >= 0 ? "+" : ""}
                          {formatNumber(data.delta, lang)}
                        </span>
                        <span className="muted ml-1.5 text-[0.66rem]">
                          {formatDate(data.fromCapturedAt, lang)} → {formatDate(data.toCapturedAt, lang)}
                        </span>
                      </span>
                    ) : (
                      <span className="muted mono text-[0.7rem]">{lang === "zh" ? "积累中" : "accumulating"}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="muted mt-2 text-[0.72rem] leading-relaxed">{tr("radarAccumulating", lang)}</p>
            <p className="mono mt-2 text-[0.66rem] text-[var(--text-2)]">
              {tr("radarSnapshots", lang)}: {snapshots.length}
            </p>
          </Card>

          {chipInfo.length > 0 ? (
            <Card title={tr("chip", lang)} icon={<Cpu size={13} aria-hidden />}>
              <ul className="space-y-2">
                {chipInfo.map((chip) => (
                  <li key={chip.slug}>
                    <Link href={`/hardware#${chip.slug}`} className="text-[0.82rem] hover:text-[var(--brand)]">
                      {chip.name}
                    </Link>
                    <div className="muted mono text-[0.66rem]">{chip.cores}</div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card title={tr("maintenance", lang)} icon={<ActivityDot pushedAt={repo.pushedAt} lang={lang} />}>
            <p className="text-[0.79rem] leading-relaxed">{content?.maintenance[lang] ?? "—"}</p>
            <dl className="mono mt-2 space-y-1 text-[0.68rem] text-[var(--text-2)]">
              <div className="flex justify-between gap-2">
                <dt>created</dt>
                <dd>{formatDate(repo.createdAt, lang)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>pushed</dt>
                <dd>{formatDate(repo.pushedAt, lang)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>default branch</dt>
                <dd>{repo.defaultBranch ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>language</dt>
                <dd>{repo.language ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>doc score (editorial)</dt>
                <dd>{repo.docScore ?? "—"}/100</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>demo score (editorial)</dt>
                <dd>{repo.demoScore ?? "—"}/100</dd>
              </div>
            </dl>
          </Card>

          {repo.topics.length > 0 ? (
            <Card title={lang === "zh" ? "GitHub topics" : "GitHub topics"} icon={<Star size={13} aria-hidden />}>
              <ul className="flex flex-wrap gap-1">
                {repo.topics.map((topic) => (
                  <li key={topic}>
                    <Link href={`/explore?q=${encodeURIComponent(topic)}`} className="pill hover:border-[var(--brand-dim)]">
                      {topic}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <div className="surface p-3">
            <p className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
              {lang === "zh" ? "数据来源" : "Data provenance"}
            </p>
            <ul className="muted mt-1 space-y-1 text-[0.72rem] leading-relaxed">
              <li>• {lang === "zh" ? "Stars / Forks / Issues / pushed_at" : "Stars / forks / issues / pushed_at"}: GitHub REST API</li>
              <li>• {lang === "zh" ? "指南、难度、评分" : "Guide, difficulty, scores"}: {lang === "zh" ? "人工整理" : "editorial"}</li>
              <li>
                • {tr("lastVerified", lang)}: {repo.lastSyncedAt ? formatDate(repo.lastSyncedAt, lang) : "—"}
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="similar-head" className="pt-2">
          <h2 id="similar-head" className="mb-2 text-[1rem] font-semibold">
            {tr("similarProjects", lang)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <RepoCard key={r.id} repo={r} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--panel)] px-3 py-2">
      <dt className="mono flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-2)]">
        {icon}
        {label}
      </dt>
      <dd className="mono mt-0.5 truncate text-[0.85rem] font-semibold">{value}</dd>
      {sub ? <dd className="mono text-[0.62rem] text-[var(--text-2)]">{sub}</dd> : null}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="surface p-4">
      <h2 className="mono flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
        {icon}
        {title}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
