import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, ShieldCheck, AlertTriangle, Languages } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { DataStatusBanner } from "@/components/data-status-banner";
import { tr } from "@/lib/i18n";
import { listTutorials } from "@/lib/repos";
import { DifficultyPill } from "@/components/repo-card";
import { SaveButton } from "@/components/save-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ESP32 教程中心",
  description: "中英文 ESP32 教程与官方文档，带来源、语言、难度与最后核验时间。",
  alternates: { canonical: "/tutorials" },
};

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = await getLang();
  const all = await listTutorials();

  const pick = (key: string) => {
    const raw = params[key];
    if (!raw) return "";
    return Array.isArray(raw) ? raw[0] : raw;
  };
  const q = pick("q").toLowerCase();
  const langFilter = pick("lang");
  const diffFilter = pick("difficulty");

  const filtered = all.filter((t) => {
    if (langFilter && t.lang !== langFilter) return false;
    if (diffFilter && t.difficulty !== diffFilter) return false;
    if (q) {
      const haystack = `${t.title.zh} ${t.title.en} ${t.source} ${t.topics.join(" ")} ${t.url}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const zh = filtered.filter((t) => t.lang === "zh");
  const en = filtered.filter((t) => t.lang === "en");
  const unverified = all.filter((t) => t.checkStatus !== "ok");

  function href(key: string, value: string) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (!v || k === key) continue;
      const val = Array.isArray(v) ? v[0] : v;
      sp.set(k, val);
    }
    if (pick(key) !== value) sp.set(key, value);
    const qs = sp.toString();
    return qs ? `/tutorials?${qs}` : "/tutorials";
  }

  return (
    <div className="space-y-4">
      <DataStatusBanner lang={lang} />
      <header className="surface p-4 sm:p-5">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{tr("tutorialsTitle", lang)}</h1>
        <p className="muted mt-1.5 max-w-[78ch] text-[0.85rem] leading-relaxed">{tr("tutorialsIntro", lang)}</p>
        <div className="rail mt-3 items-center gap-1.5 py-0.5 sm:flex-wrap">
          <span className="mono shrink-0 pr-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
            <Languages size={10} className="inline" aria-hidden /> {tr("languageLabel", lang)}
          </span>
          {[
            { value: "zh", label: "中文" },
            { value: "en", label: "English" },
          ].map((o) => (
            <Link key={o.value} href={href("lang", o.value)} className={`pill ${langFilter === o.value ? "pill-brand" : ""}`}>
              {o.label}
            </Link>
          ))}
          <span className="mono ml-2 shrink-0 pr-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
            {tr("difficulty", lang)}
          </span>
          {[
            { value: "beginner", label: lang === "zh" ? "入门" : "Beginner" },
            { value: "intermediate", label: lang === "zh" ? "进阶" : "Intermediate" },
            { value: "advanced", label: lang === "zh" ? "高级" : "Advanced" },
          ].map((o) => (
            <Link key={o.value} href={href("difficulty", o.value)} className={`pill ${diffFilter === o.value ? "pill-brand" : ""}`}>
              {o.label}
            </Link>
          ))}
          {langFilter || diffFilter || q ? (
            <Link href="/tutorials" className="mono ml-auto shrink-0 whitespace-nowrap py-1 text-[0.7rem] text-[var(--cyan)] hover:underline">
              {tr("clearFilters", lang)}
            </Link>
          ) : null}
        </div>
        <p className="mono mt-2 text-[0.66rem] text-[var(--text-2)]">
          {filtered.length} / {all.length} ·{" "}
          {unverified.length === 0
            ? lang === "zh"
              ? "所有链接写入时均返回 200"
              : "every link returned HTTP 200 when added"
            : `${unverified.length} ${tr("toVerify", lang)}`}
        </p>
      </header>

      {[
        { key: "zh", title: lang === "zh" ? "中文资源" : "Chinese", items: zh },
        { key: "en", title: lang === "zh" ? "英文资源" : "English", items: en },
      ].map((group) =>
        group.items.length === 0 ? null : (
          <section key={group.key} className="space-y-2">
            <h2 className="mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-2)]">{group.title}</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {group.items.map((tut) => (
                <li key={tut.id} className="surface card-hover flex min-w-0 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-[0.88rem] font-semibold leading-snug">
                        <a
                          href={tut.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="hover:text-[var(--brand)]"
                        >
                          {tut.title[lang]}
                        </a>
                      </h3>
                      <p className="mono mt-1 text-[0.66rem] text-[var(--text-2)]">
                        {tr("tutorialSource", lang)}: {tut.source}
                        {tut.author ? ` · ${tut.author}` : ""}
                      </p>
                    </div>
                    <SaveButton
                      id={`tutorial:${tut.slug}`}
                      kind="tutorial"
                      title={tut.title[lang]}
                      href={tut.url}
                      lang={lang}
                      compact
                    />
                  </div>

                  {tut.goal ? (
                    <p className="muted mt-2 text-[0.79rem] leading-relaxed">
                      <span className="mono text-[0.62rem] uppercase tracking-[0.1em]">
                        {tr("tutorialGoal", lang)}:{" "}
                      </span>
                      {tut.goal[lang]}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2.5">
                    <DifficultyPill level={tut.difficulty} lang={lang} />
                    {tut.checkStatus === "ok" ? (
                      <span className="pill pill-brand">
                        <ShieldCheck size={9} aria-hidden /> {tr("lastVerified", lang)} {tut.verifiedAt}
                      </span>
                    ) : (
                      <span className="pill pill-warn">
                        <AlertTriangle size={9} aria-hidden /> {tr("toVerify", lang)}
                      </span>
                    )}
                    {tut.frameworks.slice(0, 2).map((f) => (
                      <span key={f} className="pill mono">
                        {f}
                      </span>
                    ))}
                    <a
                      href={tut.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mono ml-auto text-[0.7rem] text-[var(--cyan)] hover:underline"
                    >
                      <ExternalLink size={9} className="inline" aria-hidden /> open
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}

      {filtered.length === 0 ? (
        <div className="surface px-6 py-10 text-center">
          <p className="text-[0.9rem] font-semibold">{tr("noResultsTitle", lang)}</p>
          <p className="muted mt-1 text-[0.8rem]">{tr("noResultsBody", lang)}</p>
          <Link href="/tutorials" className="btn btn-sm mt-3">
            {tr("clearFilters", lang)}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
