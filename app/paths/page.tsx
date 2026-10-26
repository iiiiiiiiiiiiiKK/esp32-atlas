import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { listPaths } from "@/lib/repos";
import { DifficultyPill } from "@/components/repo-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ESP32 实战学习路线",
  description: "10 条从零基础到开源贡献的 ESP32 学习路线，含阶段目标、前置知识、资源与完成标准。",
  alternates: { canonical: "/paths" },
};

export default async function PathsPage() {
  const lang = await getLang();
  const paths = await listPaths();

  return (
    <div className="space-y-5">
      <header className="surface p-5">
        <h1 className="text-xl font-semibold tracking-tight">{tr("pathsTitle", lang)}</h1>
        <p className="muted mt-1.5 max-w-[78ch] text-[0.85rem] leading-relaxed">{tr("pathsIntro", lang)}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {paths.map((path) => (
          <article key={path.id} className="surface card-hover flex flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[0.98rem] font-semibold tracking-tight">
                  <Link href={`/paths/${path.slug}`} className="hover:text-[var(--brand)]">
                    {path.title[lang]}
                  </Link>
                </h2>
                <p className="muted mt-1 text-[0.79rem] leading-relaxed">{path.summary[lang]}</p>
              </div>
              <span className="mono shrink-0 text-[0.68rem] text-[var(--text-2)]">
                {String(path.sortOrder + 1).padStart(2, "0")}
              </span>
            </div>

            <ul className="mt-3 space-y-1">
              {path.steps.slice(0, 4).map((step) => (
                <li key={step.id} className="flex items-baseline gap-2 text-[0.78rem]">
                  <span className="mono shrink-0 text-[0.66rem] text-[var(--brand)]">{step.stepNo}</span>
                  <span className="truncate">{step.title[lang]}</span>
                </li>
              ))}
              {path.steps.length > 4 ? (
                <li className="mono pl-5 text-[0.68rem] text-[var(--text-2)]">+{path.steps.length - 4}</li>
              ) : null}
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
              <DifficultyPill level={path.level} lang={lang} />
              <span className="pill mono">
                <Clock size={9} aria-hidden /> {path.hours}
              </span>
              <span className="pill mono">
                <Layers size={9} aria-hidden /> {path.steps.length} {tr("steps", lang)}
              </span>
              <Link href={`/paths/${path.slug}`} className="mono ml-auto text-[0.72rem] text-[var(--cyan)] hover:underline">
                {lang === "zh" ? "查看路线" : "Open path"} <ArrowRight size={10} className="inline" aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
