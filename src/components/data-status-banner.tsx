import { DatabaseZap, Info } from "lucide-react";
import type { Lang } from "@/lib/types";
import { dataStatus } from "@/lib/repos";
import { formatDate } from "@/lib/format";

/**
 * Degraded-data banner.
 *
 * Rendered *after* the page content so the server-component render order means
 * `dataStatus()` has already been set by whatever query just ran (see
 * `readWithFallback` in src/lib/repos.ts).
 *
 * This exists because the product's core promise is that every metric is live
 * and timestamped. If we are serving the build-time snapshot instead, the user
 * must be told — silently showing old stars as current would be the exact
 * failure mode this site is built to avoid.
 */
export function DataStatusBanner({ lang }: { lang: Lang }) {
  const status = dataStatus();
  if (!status.degraded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="data-degraded-banner"
      className="mt-6 rounded border border-[color-mix(in_srgb,var(--warn)_55%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3"
    >
      <p className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-[var(--warn)]">
        <DatabaseZap size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          {lang === "zh"
            ? "数据库暂时不可用，当前展示的是构建时快照数据（"
            : "The database is temporarily unavailable — showing the build-time snapshot ("}
          <span className="mono">
            {status.snapshotFetchedAt ? formatDate(status.snapshotFetchedAt, lang) : "—"}
          </span>
          {lang === "zh"
            ? `，覆盖 ${status.repoCount} 个已核验仓库）。Stars 等指标不是实时值，页面恢复后会重新同步。`
            : `, covering ${status.repoCount} verified repositories). Stars and other metrics are not live; a sync resumes once the database is back.`}
        </span>
      </p>
      <p className="mono mt-1.5 flex items-start gap-1.5 pl-5 text-[0.7rem] leading-relaxed text-[var(--text-2)]">
        <Info size={11} className="mt-0.5 shrink-0" aria-hidden />
        <span>{status.reason}</span>
      </p>
    </div>
  );
}
