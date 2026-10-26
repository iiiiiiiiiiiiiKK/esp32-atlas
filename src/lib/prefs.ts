import { cookies } from "next/headers";
import { isLang } from "./i18n";
import type { Lang } from "./types";

export { LANG_COOKIE, THEME_COOKIE, COOKIE_MAX_AGE } from "./cookie-names";
import { LANG_COOKIE, THEME_COOKIE } from "./cookie-names";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : "zh";
}

export async function getTheme(): Promise<"dark" | "light"> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";
}
