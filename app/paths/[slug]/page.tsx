import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { getPath, listRepos } from "@/lib/repos";
import { DifficultyPill } from "@/components/repo-card";
import { SaveButton } from "@/components/save-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = await getPath(slug);
  if (!path) return { title: "Not found" };
  return {
    title: path.title.zh,
    description: path.summary.zh.slice(0, 160),
    alternates: { canonical: `/paths/${path.slug}` },
  };
}

export default async function PathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const path = await getPath(slug);
  if (!path) notFound();
  const repos = await listRepos(1000);
  const repoBySlug = new Map(repos.map((r) => [r.fullName, r]));

  return (
    <div className="space-y-4">
      <Link href="/paths" className="btn btn-ghost btn-sm -ml-1">
        <ArrowLeft size={13} aria-hidden /> {tr("navPaths", lang)}
      </Link>

      <header className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[1.5rem] font-semibold tracking-tight">{path.title[lang]}</h1>
            <p className="muted mt-1.5 max-w-[78ch] text-[0.86rem] leading-relaxed">{path.summary[lang]}</p>
          </div>
          <SaveButton
            id={`path:${path.slug}`}
            kind="path"
            title={path.title[lang]}
            href={`/paths/${path.slug}`}
            lang={lang}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <DifficultyPill level={path.level} lang={lang} />
          <span className="pill mono">
            <Clock size={9} aria-hidden /> {path.hours}
          </span>
          {path.chips.map((c) => (
            <span key={c} className="pill mono">
              {c.toUpperCase()}
            </span>
          ))}
          {path.frameworks.map((f) => (
            <span key={f} className="pill pill-cyan mono">
              {f}
            </span>
          ))}
        </div>
        <p className="mono mt-2 text-[0.66rem] text-[var(--text-2)]">
          {lang === "zh"
            ? "时间为粗略估计，取决于动手频率；完成标准是可观察的结果，而不是「感觉懂了」。"
            : "Time estimates are rough and depend on how often you build. Completion criteria are observable outcomes, not a feeling of understanding."}
        </p>
      </header>

      <ol className="space-y-3">
        {path.steps.map((step) => (
          <li key={step.id} className="surface relative min-w-0 p-4 pl-12">
            <span className="mono absolute left-4 top-4 grid h-6 w-6 place-items-center rounded border border-[var(--brand-dim)] text-[0.7rem] font-semibold text-[var(--brand)]">
              {step.stepNo}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[0.95rem] font-semibold">{step.title[lang]}</h2>
              {step.estimate ? <span className="pill mono">{step.estimate}</span> : null}
            </div>

            <dl className="mt-2 space-y-2">
              <div>
                <dt className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">{tr("goal", lang)}</dt>
                <dd className="mt-0.5 text-[0.82rem] leading-relaxed">{step.goal[lang]}</dd>
              </div>

              {step.doneWhen ? (
                <div>
                  <dt className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
                    {tr("doneWhen", lang)}
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5 text-[0.82rem] leading-relaxed">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 brand-text" aria-hidden />
                    {step.doneWhen[lang]}
                  </dd>
                </div>
              ) : null}

              {step.resources.length > 0 ? (
                <div>
                  <dt className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
                    {tr("resources", lang)}
                  </dt>
                  <dd className="mt-1">
                    <ul className="flex flex-wrap gap-1.5">
                      {step.resources.map((res, i) => (
                        <li key={i}>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="pill hover:border-[var(--brand-dim)] hover:text-[var(--text)]"
                          >
                            {res.label[lang]}
                            <ExternalLink size={9} aria-hidden />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}

              {step.projects.length > 0 ? (
                <div>
                  <dt className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
                    {tr("relatedProjects", lang)}
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {step.projects.map((fullName) => {
                      const repo = repoBySlug.get(fullName);
                      return repo ? (
                        <Link key={fullName} href={`/projects/${repo.slug}`} className="pill pill-brand hover:underline">
                          {fullName}
                        </Link>
                      ) : (
                        <a
                          key={fullName}
                          href={`https://github.com/${fullName}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="pill"
                        >
                          {fullName} ↗
                        </a>
                      );
                    })}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}
