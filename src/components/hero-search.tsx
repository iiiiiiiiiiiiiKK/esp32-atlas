"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { tr } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function HeroSearch({ lang, defaultValue = "" }: { lang: Lang; defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <form onSubmit={submit} role="search" className="w-full">
      <label htmlFor="hero-search" className="sr-only">
        {tr("searchPlaceholder", lang)}
      </label>
      <div className="relative">
        <Search
          size={17}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]"
        />
        <input
          id="hero-search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tr("searchPlaceholder", lang)}
          className="field h-12 pl-9 pr-24 text-[0.9rem]"
          autoComplete="off"
          data-testid="hero-search-input"
        />
        <button type="submit" className="btn btn-primary absolute right-1.5 top-1.5 h-9" data-testid="hero-search-submit">
          {tr("searchAction", lang)}
        </button>
      </div>
      <p className="mono mt-1.5 text-[0.68rem] text-[var(--text-2)]">{tr("searchHint", lang)}</p>
    </form>
  );
}
