import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, AlertTriangle, ShieldCheck, MoveHorizontal } from "lucide-react";
import { getLang } from "@/lib/prefs";
import { DataStatusBanner } from "@/components/data-status-banner";
import { tr } from "@/lib/i18n";
import { listChips, listRepos } from "@/lib/repos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ESP32 芯片与硬件指南",
  description: "ESP32 / S2 / S3 / C3 / C6 / H2 / P4 规格对比，引用 Espressif 官方文档，开发板与芯片能力分开标注。",
  alternates: { canonical: "/hardware" },
};

const SPEC_ROWS = [
  { key: "cores", zh: "CPU / 核心", en: "CPU / cores" },
  { key: "clock", zh: "最高主频", en: "Max clock" },
  { key: "sram", zh: "内部 SRAM", en: "Internal SRAM" },
  { key: "flash", zh: "Flash（模组）", en: "Flash (module)" },
  { key: "wifi", zh: "Wi-Fi", en: "Wi-Fi" },
  { key: "ble", zh: "Bluetooth", en: "Bluetooth" },
  { key: "threadZigbee", zh: "Thread / Zigbee", en: "Thread / Zigbee" },
  { key: "usb", zh: "USB", en: "USB" },
  { key: "camera", zh: "摄像头接口", en: "Camera interface" },
  { key: "display", zh: "显示接口", en: "Display interface" },
] as const;

export default async function HardwarePage() {
  const lang = await getLang();
  const [chips, repos] = await Promise.all([listChips(), listRepos(1000)]);

  return (
    <div className="space-y-4">
      <DataStatusBanner lang={lang} />
      <header className="surface p-4 sm:p-5">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{tr("hardwareTitle", lang)}</h1>
        <p className="muted mt-1.5 max-w-[80ch] text-[0.85rem] leading-relaxed">{tr("hardwareIntro", lang)}</p>
        <p className="mono mt-2 text-[0.66rem] text-[var(--text-2)]">
          {lang === "zh"
            ? "规格最后核验：2026-10-25 · 来源：Espressif 产品页 / ESP-IDF 文档 · 无法确认的字段标为待核验"
            : "Specs last verified 2026-10-25 · Sources: Espressif product pages and ESP-IDF docs · unconfirmable fields are flagged"}
        </p>
      </header>

      {/* Comparison table: horizontal scroll stays inside this box on phones. */}
      <section className="surface overflow-hidden">
        <p className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2 text-[0.75rem] text-[var(--text-2)] lg:hidden">
          <MoveHorizontal size={13} aria-hidden />
          {lang === "zh" ? "左右滑动查看全部芯片列" : "Swipe sideways to see every chip column"}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <caption className="sr-only">{tr("hardwareTitle", lang)}</caption>
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--panel-2)]">
                <th scope="col" className="mono px-3 py-2 text-[0.66rem] uppercase tracking-[0.1em] text-[var(--text-2)]">
                  {lang === "zh" ? "规格" : "Spec"}
                </th>
                {chips.map((chip) => (
                  <th key={chip.slug} scope="col" className="px-3 py-2 align-bottom">
                    <a href={`#${chip.slug}`} className="text-[0.82rem] font-semibold hover:text-[var(--brand)]">
                      {chip.name}
                    </a>
                    <div className="mono text-[0.62rem] font-normal text-[var(--text-2)]">{chip.family}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="mono px-3 py-2 text-[0.68rem] font-normal text-[var(--text-2)]">
                    {lang === "zh" ? row.zh : row.en}
                  </th>
                  {chips.map((chip) => (
                    <td key={chip.slug} className="px-3 py-2 text-[0.75rem] leading-snug">
                      {(chip[row.key] as string | null) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {chips.map((chip) => {
          const related = repos.filter((r) => r.chips.includes(chip.slug)).slice(0, 4);
          return (
            <article key={chip.slug} id={chip.slug} className="surface scroll-mt-20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-[1rem] font-semibold">
                    {chip.name} <span className="muted mono text-[0.68rem]">{chip.family}</span>
                  </h2>
                  <p className="mono text-[0.66rem] text-[var(--text-2)]">
                    {chip.cores} · {chip.clock}
                  </p>
                </div>
                {chip.confidence === "verified" ? (
                  <span className="pill pill-brand shrink-0">
                    <ShieldCheck size={9} aria-hidden /> {lang === "zh" ? "已核验" : "verified"}
                  </span>
                ) : (
                  <span className="pill pill-warn shrink-0">
                    <AlertTriangle size={9} aria-hidden /> {tr("toVerify", lang)}
                  </span>
                )}
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {SPEC_ROWS.slice(2, 8).map((row) => (
                  <div key={row.key}>
                    <dt className="mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-2)]">
                      {lang === "zh" ? row.zh : row.en}
                    </dt>
                    <dd className="text-[0.75rem] leading-snug">{(chip[row.key] as string | null) ?? "—"}</dd>
                  </div>
                ))}
              </dl>

              {chip.useCases ? (
                <p className="muted mt-3 text-[0.79rem] leading-relaxed">
                  <span className="mono text-[0.62rem] uppercase tracking-[0.1em]">{tr("useCases", lang)}: </span>
                  {chip.useCases[lang]}
                </p>
              ) : null}

              <div className="mt-2.5">
                <div className="mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-2)]">
                  {tr("commonBoards", lang)}
                </div>
                <ul className="mt-1 flex flex-wrap gap-1">
                  {chip.boards.map((b) => (
                    <li key={b} className="pill">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {related.length > 0 ? (
                <div className="mt-2.5">
                  <div className="mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-2)]">
                    {tr("relatedProjects", lang)}
                  </div>
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link href={`/projects/${r.slug}`} className="pill pill-cyan hover:underline">
                          {r.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chip.officialUrl ? (
                <a
                  href={chip.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mono mt-3 inline-flex items-center gap-1 text-[0.7rem] text-[var(--cyan)] hover:underline"
                >
                  <ExternalLink size={9} aria-hidden /> {tr("officialDocs", lang)}
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
