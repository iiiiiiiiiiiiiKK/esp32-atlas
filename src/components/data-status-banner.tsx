import { DatabaseZap, Info } from "lucide-react";
import type { Lang } from "@/lib/types";
import { dataStatus } from "@/lib/repos";
import { formatDate } from "@/lib/format";
import { explainReason } from "@/lib/degraded-copy";

/**
 * Degraded-data banner.
 *
 * Rendered after the page content so the server-component render order means
 * `dataStatus()` has already been set by whatever query just ran (see
 * `readWithFallback` in src/lib/repos.ts).
 *
 * This exists because the product's core promise is that every metric is live
 * and timestamped. If we are serving the build-time snapshot instead, the user
 * must be told — silently showing old stars as current would be the exact
 * failure mode this site is built to avoid.
 *
 * The raw driver message is kept (it is the evidence) but demoted to a
 * collapsible detail block and forced to wrap: it contains a bare URL with no
 * spaces, which is what overflowed the layout on phones.
 */
export function DataStatusBanner({ lang }: { lang: Lang }) {
  const status = dataStatus();
  if (!status.degraded) return null;

  const human = explainReason(status.reason, lang);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="data-degraded-banner"
      className="mt-6 overflow-hidden rounded border border-[color-mix(in_srgb,var(--warn)_55%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3"
    >
      <p className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-[var(--warn)]">
        <DatabaseZap size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span className="min-w-0 wrap-anywhere">
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

      {/* Human-readable cause first — a raw driver string is not an explanation. */}
      <p className="mt-2 flex items-start gap-1.5 pl-5 text-[0.78rem] leading-relaxed text-[var(--text)] wrap-anywhere">
        <Info size={12} className="mt-0.5 shrink-0 text-[var(--text-2)]" aria-hidden />
        <span className="min-w-0">
          <span className="text-[var(--text-2)]">
            {lang === "zh" ? "原因：" : "Cause: "}
          </span>
          {human.summary}
        </span>
      </p>

      {human.detail ? (
        <p className="mt-1 pl-5 text-[0.75rem] leading-relaxed text-[var(--text-2)] wrap-anywhere">
          {human.detail}
        </p>
      ) : null}

      <details className="mt-2 pl-5">
        <summary className="mono cursor-pointer list-none text-[0.7rem] text-[var(--text-2)] hover:text-[var(--text)]">
          {lang === "zh" ? "技术详情 ▾" : "Technical detail ▾"}
        </summary>
        <p className="mono mt-1 break-all rounded border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[0.68rem] leading-relaxed text-[var(--text-2)]">
          {status.reason ?? "—"}
        </p>
      </details>
    </div>
  );
}
