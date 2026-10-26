"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Lang } from "@/lib/types";

/**
 * Search field for /explore. A real <form method="get"> so it works without JS,
 * with a router push for the instant path. All other filters ride along as
 * hidden inputs so searching never silently drops the user's current facets.
 */
export function FilterSearch({
  lang,
  base,
  initialQuery,
}: {
  lang: Lang;
  base: Record<string, string | string[] | undefined>;
  initialQuery: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const preserved: Array<[string, string]> = [];
  for (const [key, raw] of Object.entries(base)) {
    if (!raw || key === "q" || key === "page") continue;
    const values = Array.isArray(raw) ? raw : String(raw).split(",");
    for (const v of values) if (v) preserved.push([key, v]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    for (const [k, v] of preserved) sp.append(k, v);
    const q = value.trim();
    if (q) sp.set("q", q);
    router.push(sp.toString() ? `/explore?${sp.toString()}` : "/explore");
  }

  return (
    <form onSubmit={submit} action="/explore" method="get" role="search" className="relative w-full">
      {preserved.map(([k, v], i) => (
        <input key={`${k}-${i}`} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor="explore-q" className="sr-only">
        {lang === "zh" ? "搜索项目" : "Search projects"}
      </label>
      <Search
        size={15}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]"
      />
      <input
        id="explore-q"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={lang === "zh" ? "搜索仓库、描述、标签…" : "Search repos, descriptions, tags…"}
        className="field h-11 pl-9 pr-[5.4rem] text-[0.85rem] sm:h-10"
        autoComplete="off"
        data-testid="explore-search"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            const sp = new URLSearchParams();
            for (const [k, v] of preserved) sp.append(k, v);
            router.push(sp.toString() ? `/explore?${sp.toString()}` : "/explore");
          }}
          aria-label={lang === "zh" ? "清除搜索" : "Clear search"}
          className="absolute right-[3.9rem] top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded text-[var(--text-2)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
        >
          <X size={15} aria-hidden />
        </button>
      ) : null}
      <button type="submit" className="btn btn-sm absolute right-1 top-1 h-9 px-2.5 text-[0.78rem] sm:h-8">
        {lang === "zh" ? "搜索" : "Go"}
      </button>
    </form>
  );
}
