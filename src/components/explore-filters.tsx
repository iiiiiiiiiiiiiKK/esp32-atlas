import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { CHIPS } from "@/content/chips";
import { CATEGORY_LABELS } from "@/components/repo-card";

const FRAMEWORK_LABELS: Record<string, string> = {
  arduino: "Arduino",
  "esp-idf": "ESP-IDF",
  esphome: "ESPHome",
  platformio: "PlatformIO",
  micropython: "MicroPython",
  rust: "Rust",
  javascript: "JavaScript",
  "c-plus-plus": "C/C++",
  yaml: "YAML",
};

const DIFFICULTY_LABELS: Record<string, { zh: string; en: string }> = {
  beginner: { zh: "入门", en: "Beginner" },
  intermediate: { zh: "进阶", en: "Intermediate" },
  advanced: { zh: "高级", en: "Advanced" },
};

const FLAG_LABELS: Record<string, { zh: string; en: string }> = {
  active: { zh: "近期活跃", en: "Recently active" },
  release: { zh: "近期发布", en: "Recent release" },
  documented: { zh: "文档完整", en: "Well documented" },
  beginner: { zh: "适合新手", en: "Beginner friendly" },
  tutorial: { zh: "有教程", en: "Has tutorial" },
  demo: { zh: "有演示", en: "Has demo" },
};

export interface ExplorerOptions {
  languages: string[];
  licenses: string[];
}

/**
 * Facet links are plain anchors pointing at the fully-encoded URL, so every
 * filter state is shareable and works without JS.
 */
function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function buildHref(
  base: Record<string, string | string[] | undefined>,
  key: string,
  value: string,
): string {
  const sp = new URLSearchParams();
  const push = (k: string, v: string | string[]) => {
    const arr = Array.isArray(v) ? v : v.split(",");
    for (const item of arr) if (item) sp.append(k, item);
  };
  for (const [k, v] of Object.entries(base)) {
    if (!v || k === "page") continue;
    if (k === key) {
      const current = (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
      for (const item of toggleValue(current, value)) sp.append(k, item);
    } else {
      push(k, v);
    }
  }
  if (!(key in base) || base[key] === undefined) sp.append(key, value);
  const qs = sp.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function isActive(base: Record<string, string | string[] | undefined>, key: string, value: string): boolean {
  const raw = base[key];
  if (!raw) return false;
  const arr = Array.isArray(raw) ? raw : raw.split(",");
  return arr.includes(value);
}

export function ExploreFiltersPanel({
  lang,
  base,
  options,
  activeCount,
}: {
  lang: "zh" | "en";
  base: Record<string, string | string[] | undefined>;
  options: ExplorerOptions;
  activeCount: number;
}) {
  return (
    <aside className="space-y-3" aria-label={lang === "zh" ? "筛选" : "Filters"}>
      <div className="surface flex items-center justify-between px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold">
          <SlidersHorizontal size={13} aria-hidden />
          {lang === "zh" ? "筛选" : "Filters"}
        </span>
        <div className="flex items-center gap-2">
          <span className="mono text-[0.66rem] text-[var(--text-2)]">{activeCount}</span>
          {activeCount > 0 ? (
            <Link href="/explore" className="mono text-[0.68rem] text-[var(--cyan)] hover:underline">
              {lang === "zh" ? "清除" : "clear"}
            </Link>
          ) : null}
        </div>
      </div>

      <FacetGroup title={lang === "zh" ? "项目类别" : "Category"}>
        {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
          <FacetLink
            key={slug}
            href={buildHref(base, "category", slug)}
            active={isActive(base, "category", slug)}
          >
            {label[lang]}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "芯片" : "Chip"}>
        {CHIPS.map((chip) => (
          <FacetLink key={chip.slug} href={buildHref(base, "chip", chip.slug)} active={isActive(base, "chip", chip.slug)}>
            {chip.name}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "开发框架" : "Framework"}>
        {Object.entries(FRAMEWORK_LABELS).map(([slug, label]) => (
          <FacetLink
            key={slug}
            href={buildHref(base, "framework", slug)}
            active={isActive(base, "framework", slug)}
          >
            {label}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "难度" : "Difficulty"}>
        {Object.entries(DIFFICULTY_LABELS).map(([slug, label]) => (
          <FacetLink
            key={slug}
            href={buildHref(base, "difficulty", slug)}
            active={isActive(base, "difficulty", slug)}
          >
            {label[lang]}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "特征" : "Signals"}>
        {Object.entries(FLAG_LABELS).map(([slug, label]) => (
          <FacetLink key={slug} href={buildHref(base, "flag", slug)} active={isActive(base, "flag", slug)}>
            {label[lang]}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "语言" : "Language"}>
        {options.languages.map((value) => (
          <FacetLink key={value} href={buildHref(base, "language", value)} active={isActive(base, "language", value)}>
            {value}
          </FacetLink>
        ))}
      </FacetGroup>

      <FacetGroup title={lang === "zh" ? "许可证" : "License"}>
        {options.licenses.map((value) => (
          <FacetLink key={value} href={buildHref(base, "license", value)} active={isActive(base, "license", value)}>
            {value}
          </FacetLink>
        ))}
      </FacetGroup>

      <div className="surface p-3">
        <p className="mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
          {lang === "zh" ? "数据说明" : "About the data"}
        </p>
        <p className="muted mt-1 text-[0.72rem] leading-relaxed">
          {lang === "zh"
            ? "Stars / Forks / Issues 来自 GitHub API；难度、文档完整度与演示可用度是编辑评估，非 GitHub 指标。"
            : "Stars, forks and issues come from the GitHub API. Difficulty, doc quality and demo usability are editorial estimates, not GitHub metrics."}
        </p>
      </div>
    </aside>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface p-3">
      <h3 className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-2)]">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-1">{children}</ul>
    </div>
  );
}

function FacetLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={`pill ${active ? "pill-brand" : ""} transition-colors hover:border-[var(--brand-dim)] hover:text-[var(--text)]`}
        scroll={false}
      >
        {children}
        {active ? <ArrowUpRight size={9} aria-hidden /> : null}
      </Link>
    </li>
  );
}
