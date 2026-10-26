import Link from "next/link";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function EmptyState({
  title,
  body,
  cta,
  lang,
  testId = "empty-state",
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
  lang: Lang;
  testId?: string;
}) {
  return (
    <div className="surface grid place-items-center px-6 py-12 text-center" data-testid={testId}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden className="opacity-70">
        <rect x="6" y="6" width="44" height="44" rx="3" fill="none" stroke="var(--border-strong)" strokeWidth="1.2" />
        <path d="M6 34h10l4-8 6 16 4-8h20" fill="none" stroke="var(--brand-dim)" strokeWidth="1.4" />
        <circle cx="16" cy="18" r="1.6" fill="var(--cyan)" />
        <circle cx="40" cy="18" r="1.6" fill="var(--border-strong)" />
      </svg>
      <h3 className="mt-4 text-[0.95rem] font-semibold">{title}</h3>
      <p className="muted mt-1.5 max-w-[52ch] text-[0.8rem] leading-relaxed">{body}</p>
      {cta ? (
        <Link href={cta.href} className="btn mt-4">
          {cta.label}
        </Link>
      ) : null}
      <span className="mono mt-4 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
        {tr("noResultsTitle", lang) === title ? "" : "ESP32 Atlas"}
      </span>
    </div>
  );
}
