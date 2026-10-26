import Link from "next/link";
import { Star, GitFork, CircleDot, Clock, Tag } from "lucide-react";
import type { Lang, RepoRecord } from "@/lib/types";
import { relativeDays, formatNumber } from "@/lib/format";
import { activityBucket } from "@/lib/search";
import { CoverArt } from "./cover-art";
import { SaveButton } from "./save-button";

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "pill-brand",
  intermediate: "pill-cyan",
  advanced: "pill-warn",
};

export function DifficultyPill({ level, lang }: { level: string | null; lang: Lang }) {
  if (!level) return null;
  const label =
    level === "beginner"
      ? lang === "zh" ? "入门" : "Beginner"
      : level === "intermediate"
        ? lang === "zh" ? "进阶" : "Intermediate"
        : lang === "zh" ? "高级" : "Advanced";
  return <span className={`pill ${DIFFICULTY_COLOR[level] ?? ""}`}>{label}</span>;
}

export function ActivityDot({ pushedAt, lang }: { pushedAt: string | null; lang: Lang }) {
  const bucket = activityBucket(pushedAt);
  const color =
    bucket === "hot" ? "var(--brand)" : bucket === "warm" ? "var(--cyan)" : bucket === "cold" ? "var(--warn)" : "var(--danger)";
  const label =
    bucket === "hot"
      ? lang === "zh" ? "本周有提交" : "Pushed this week"
      : bucket === "warm"
        ? lang === "zh" ? "近期活跃" : "Recently active"
        : bucket === "cold"
          ? lang === "zh" ? "较久未更新" : "Quiet for a while"
          : lang === "zh" ? "长期未更新" : "Dormant";
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--text-2)]">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function RepoCard({
  repo,
  lang,
  reasons,
  compact = false,
}: {
  repo: RepoRecord;
  lang: Lang;
  reasons?: string[];
  compact?: boolean;
}) {
  const summary = repo.summary ? repo.summary[lang] || repo.summary.zh : repo.description ?? "";
  return (
    <article className="surface card-hover group relative flex flex-col overflow-hidden">
      <Link href={`/projects/${repo.slug}`} className="absolute inset-0 z-0" aria-label={repo.fullName} />
      <div className={`relative z-0 overflow-hidden border-b border-[var(--border)] ${compact ? "h-14" : "h-16 sm:h-24"}`}>
        <CoverArt repo={repo} className="h-full w-full" showLabel={!compact} />
      </div>
      <div className={`relative z-10 flex flex-1 flex-col gap-1.5 ${compact ? "p-3" : "p-3 sm:gap-2 sm:p-4"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-semibold tracking-tight sm:text-[0.9rem]">
              <span className="text-[var(--text-2)]">{repo.owner}/</span>
              {repo.name}
            </h3>
            <div className="mono mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[0.72rem] text-[var(--text-2)] sm:text-[0.68rem]">
              <span className="inline-flex items-center gap-1">
                <Star size={10} aria-hidden /> {formatNumber(repo.stars, lang)}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork size={10} aria-hidden /> {formatNumber(repo.forks, lang)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CircleDot size={10} aria-hidden /> {formatNumber(repo.openIssues, lang)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={10} aria-hidden /> {relativeDays(repo.pushedAt, lang)}
              </span>
            </div>
          </div>
          <div className="relative z-20 shrink-0">
            <SaveButton
              id={`repo:${repo.slug}`}
              kind="repo"
              title={repo.fullName}
              href={`/projects/${repo.slug}`}
              subtitle={summary.slice(0, 120)}
              lang={lang}
              compact
            />
          </div>
        </div>

        <p className={`muted text-[0.82rem] leading-relaxed sm:text-[0.79rem] ${compact ? "truncate-2" : "truncate-3"}`}>{summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <DifficultyPill level={repo.difficulty} lang={lang} />
          {repo.category ? (
            <span className="pill">
              <Tag size={9} aria-hidden />
              {categoryLabel(repo.category, lang)}
            </span>
          ) : null}
          {repo.chips.slice(0, 2).map((chip) => (
            <span key={chip} className="pill mono">
              {chip.toUpperCase().replace("ESP32-", "ESP32-")}
            </span>
          ))}
          {repo.latestReleaseTag ? <span className="pill">{repo.latestReleaseTag}</span> : null}
          {repo.archived ? <span className="pill pill-danger">{lang === "zh" ? "已归档" : "Archived"}</span> : null}
        </div>

        {reasons && reasons.length > 0 ? (
          <div className="flex flex-wrap gap-1 border-t border-[var(--border)] pt-2">
            {reasons.slice(0, 3).map((r) => (
              <span key={r} className="pill pill-cyan">
                {reasonLabel(r, lang)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function reasonLabel(reason: string, lang: Lang): string {
  const map: Record<string, { zh: string; en: string }> = {
    active: { zh: "近期活跃", en: "recently active" },
    inactive: { zh: "长期未更新", en: "dormant" },
    popular: { zh: "高关注度", en: "widely used" },
    documented: { zh: "文档完整", en: "well documented" },
    demo: { zh: "有演示", en: "has demo" },
    beginner: { zh: "适合新手", en: "beginner friendly" },
    release: { zh: "近期发版", en: "recent release" },
    editorial: { zh: "编辑推荐", en: "editor's pick" },
    archived: { zh: "已归档", en: "archived" },
    match: { zh: "命中关键词", en: "keyword match" },
    goal: { zh: "匹配目标", en: "matches goal" },
  };
  return map[reason] ? map[reason][lang] : reason;
}

export const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  "ai-voice": { zh: "AI 语音", en: "AI voice" },
  "smart-home": { zh: "智能家居", en: "Smart home" },
  display: { zh: "显示屏", en: "Display" },
  robotics: { zh: "机器人", en: "Robotics" },
  led: { zh: "LED 灯效", en: "LED" },
  sensors: { zh: "传感器", en: "Sensors" },
  wireless: { zh: "无线通信", en: "Wireless" },
  "dev-toolkit": { zh: "开发框架", en: "Dev toolkit" },
  "camera-vision": { zh: "摄像头视觉", en: "Camera & vision" },
};

export function categoryLabel(slug: string, lang: Lang): string {
  return CATEGORY_LABELS[slug]?.[lang] ?? slug;
}
