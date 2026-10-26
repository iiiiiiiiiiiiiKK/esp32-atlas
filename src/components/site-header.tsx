"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, CircuitBoard } from "lucide-react";
import type { Lang } from "@/lib/types";
import { tr, type DictKey } from "@/lib/i18n";
import { PrefControls } from "./pref-controls";

const NAV: Array<{ href: string; key: DictKey }> = [
  { href: "/explore", key: "navExplore" },
  { href: "/paths", key: "navPaths" },
  { href: "/tutorials", key: "navTutorials" },
  { href: "/hardware", key: "navHardware" },
  { href: "/radar", key: "navRadar" },
  { href: "/collections", key: "navCollections" },
];

export function SiteHeader({ lang, theme }: { lang: Lang; theme: "dark" | "light" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="ESP32 Atlas">
          <span className="grid h-7 w-7 place-items-center rounded-[4px] border border-[var(--brand-dim)] text-[var(--brand)]">
            <CircuitBoard size={16} aria-hidden />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight">
            ESP32 <span className="brand-text">Atlas</span>
          </span>
        </Link>

        <nav aria-label="primary" className="ml-2 hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2.5 py-1.5 text-[0.82rem] text-[var(--text-2)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--cyan)]"
            >
              {tr(item.key, lang)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Link href="/submit" className="btn btn-sm hidden md:inline-flex">
            {tr("navSubmit", lang)}
          </Link>
          <Link href="/admin" className="btn btn-ghost btn-sm hidden md:inline-flex" aria-label={tr("navAdmin", lang)}>
            {tr("navAdmin", lang)}
          </Link>
          <PrefControls lang={lang} theme={theme} />
          <button
            type="button"
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="mobile" className="border-t border-[var(--border)] bg-[var(--panel)] lg:hidden">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-1 px-4 py-3 sm:px-6">
            {[...NAV, { href: "/submit" as const, key: "navSubmit" as DictKey }, { href: "/admin", key: "navAdmin" as DictKey }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
                >
                  {tr(item.key, lang)}
                </Link>
              ),
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
