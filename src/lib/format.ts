import type { Lang } from "./types";

const LOCALE: Record<Lang, string> = { zh: "zh-CN", en: "en-US" };

export function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], { notation: n >= 10000 ? "compact" : "standard" }).format(n);
}

export function formatDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE[lang], {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function relativeDays(iso: string | null | undefined, lang: Lang, now = Date.now()): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const days = Math.floor((now - t) / 86400000);
  if (days <= 0) return lang === "zh" ? "今天" : "today";
  if (days === 1) return lang === "zh" ? "昨天" : "yesterday";
  if (days < 30) return lang === "zh" ? `${days} 天前` : `${days} days ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return lang === "zh" ? `${months} 个月前` : `${months} mo ago`;
  }
  const years = Math.floor(days / 365);
  return lang === "zh" ? `${years} 年前` : `${years} yr ago`;
}

export function repoSlug(fullName: string): string {
  return fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function repoCover(fullName: string): string {
  // Deterministic generated cover: no third-party images, never 404s.
  const seed = [...fullName].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7);
  const hue = seed;
  return `/api/cover?seed=${hue}&label=${encodeURIComponent(fullName.split("/")[1] ?? fullName)}`;
}
