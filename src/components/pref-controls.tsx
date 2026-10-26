"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Moon, Sun, Languages } from "lucide-react";
import type { Lang } from "@/lib/types";
import { COOKIE_MAX_AGE, LANG_COOKIE, THEME_COOKIE } from "@/lib/cookie-names";
import { tr } from "@/lib/i18n";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function PrefControls({ lang, theme }: { lang: Lang; theme: "dark" | "light" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentTheme, setCurrentTheme] = useState(theme);

  function toggleTheme() {
    const next = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    setCookie(THEME_COOKIE, next);
    document.documentElement.classList.toggle("light", next === "light");
    startTransition(() => router.refresh());
  }

  function switchLang() {
    setCookie(LANG_COOKIE, lang === "zh" ? "en" : "zh");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={switchLang}
        aria-label={tr("langSwitch", lang)}
        className="btn btn-ghost btn-sm mono"
        data-testid="lang-switch"
        disabled={pending}
      >
        <Languages size={14} aria-hidden />
        <span className="hidden xs:inline">{lang === "zh" ? "EN" : "中文"}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tr("themeToggle", lang)}
        className="btn btn-ghost btn-sm"
        data-testid="theme-toggle"
        disabled={pending}
      >
        {currentTheme === "dark" ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
      </button>
    </div>
  );
}
