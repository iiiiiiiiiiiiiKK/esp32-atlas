import type { Metadata } from "next";
import "./globals.css";
import { getLang, getTheme } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "ESP32 Atlas — ESP32 开源项目地图",
    template: "%s · ESP32 Atlas",
  },
  description:
    "按目标找 ESP32 项目、按证据选芯片、按路线学到底。真实 GitHub 指标 + 人工核验的教程与硬件指南。",
  metadataBase: new URL("https://esp32-atlas.changyuansex.workers.dev"),
  openGraph: {
    type: "website",
    siteName: "ESP32 Atlas",
    title: "ESP32 Atlas — ESP32 开源项目地图",
    description:
      "按目标找 ESP32 项目、按证据选芯片、按路线学到底。真实 GitHub 指标 + 人工核验的教程与硬件指南。",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  return (
    <html lang={lang === "zh" ? "zh-CN" : "en"} className={theme === "light" ? "light" : ""}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--brand)] focus:px-3 focus:py-2 focus:text-[#08120c]">
          {tr("skipToContent", lang)}
        </a>
        <SiteHeader lang={lang} theme={theme} />
        <main id="main" className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
