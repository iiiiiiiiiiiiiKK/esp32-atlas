"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import type { Lang } from "@/lib/types";

/**
 * Mobile filter drawer.
 *
 * On a phone the facet panel sits ~4 000px below the results if left in the
 * document flow, which is effectively unreachable. This renders the same
 * server-built facet panel inside a bottom sheet opened from a sticky toolbar.
 *
 * `children` is the server-rendered <ExploreFiltersPanel/>, so filter logic, URL
 * encoding and markup stay in exactly one place.
 *
 * The sheet is portalled to <body>: the trigger lives inside a `backdrop-blur`
 * toolbar, and a filtered ancestor becomes the containing block for
 * `position: fixed`, which would anchor the sheet to the toolbar instead of the
 * viewport.
 */
export function MobileFilterSheet({
  lang,
  activeCount,
  resultCount,
  children,
}: {
  lang: Lang;
  activeCount: number;
  resultCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sheet = open ? (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={lang === "zh" ? "筛选" : "Filters"}
    >
      <button
        type="button"
        aria-label={lang === "zh" ? "关闭筛选" : "Close filters"}
        className="absolute inset-0 h-full w-full bg-[rgba(4,10,9,0.74)]"
        onClick={() => setOpen(false)}
      />
      <div
        id="filter-sheet"
        data-testid="filter-sheet"
        className="relative flex max-h-[86dvh] w-full flex-col rounded-t-md border-t border-[var(--border-strong)] bg-[var(--bg)] shadow-[0_-18px_40px_-20px_rgba(0,0,0,0.9)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
          <h2 className="inline-flex items-center gap-1.5 text-[0.92rem] font-semibold">
            <SlidersHorizontal size={14} aria-hidden />
            {lang === "zh" ? "筛选" : "Filters"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="btn btn-sm btn-ghost px-2"
            onClick={() => setOpen(false)}
            aria-label={lang === "zh" ? "关闭" : "Close"}
            data-testid="close-filters"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">{children}</div>

        <div className="shrink-0 border-t border-[var(--border)] px-4 py-3">
          <button type="button" className="btn btn-primary w-full" onClick={() => setOpen(false)} data-testid="apply-filters">
            {lang === "zh" ? `查看 ${resultCount} 个结果` : `Show ${resultCount} results`}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-sm shrink-0 lg:hidden"
        aria-expanded={open}
        aria-controls={open ? "filter-sheet" : undefined}
        data-testid="open-filters"
      >
        <SlidersHorizontal size={13} aria-hidden />
        {lang === "zh" ? "筛选" : "Filters"}
        {activeCount > 0 ? (
          <span className="mono rounded-[3px] bg-[var(--brand)] px-1 text-[0.7rem] font-semibold text-[#08120c]">
            {activeCount}
          </span>
        ) : null}
      </button>
      {mounted && sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
