import type { Metadata } from "next";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { CollectionsClient } from "@/components/collections-client";

export const metadata: Metadata = {
  title: "我的清单",
  description: "在浏览器本地保存想做的 ESP32 项目、教程与学习路线，支持备注、状态和 JSON 导出。",
  alternates: { canonical: "/collections" },
  robots: { index: false, follow: false },
};

export default async function CollectionsPage() {
  const lang = await getLang();
  return (
    <div className="space-y-4">
      <header className="surface p-5">
        <h1 className="text-xl font-semibold tracking-tight">{tr("collectionsTitle", lang)}</h1>
        <p className="muted mt-1.5 max-w-[78ch] text-[0.85rem] leading-relaxed">{tr("collectionsIntro", lang)}</p>
      </header>
      <CollectionsClient lang={lang} />
    </div>
  );
}
