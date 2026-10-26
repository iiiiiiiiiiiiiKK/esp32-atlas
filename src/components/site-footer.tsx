import Link from "next/link";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  const cols: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
    {
      title: lang === "zh" ? "探索" : "Explore",
      links: [
        { href: "/explore", label: tr("navExplore", lang) },
        { href: "/radar", label: tr("navRadar", lang) },
        { href: "/paths", label: tr("navPaths", lang) },
      ],
    },
    {
      title: lang === "zh" ? "资料" : "Reference",
      links: [
        { href: "/tutorials", label: tr("navTutorials", lang) },
        { href: "/hardware", label: tr("navHardware", lang) },
        { href: "/collections", label: tr("navCollections", lang) },
      ],
    },
    {
      title: lang === "zh" ? "参与" : "Participate",
      links: [
        { href: "/submit", label: tr("navSubmit", lang) },
        { href: "/admin", label: tr("navAdmin", lang) },
        { href: "/about", label: lang === "zh" ? "关于与数据说明" : "About & data" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm font-semibold">
              ESP32 <span className="brand-text">Atlas</span>
            </div>
            <p className="muted mt-2 max-w-xs text-[0.8rem] leading-relaxed">{tr("footerNote", lang)}</p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-2)]">{col.title}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[0.82rem] text-[var(--text-2)] hover:text-[var(--text)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[0.7rem] text-[var(--text-2)]">
            MIT License · GitHub API metrics · {new Date().getUTCFullYear()}
          </p>
          <p className="mono text-[0.7rem] text-[var(--text-2)]">
            Built with Next.js + Cloudflare D1 · open source
          </p>
        </div>
      </div>
    </footer>
  );
}
