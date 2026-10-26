import type { Metadata } from "next";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "提交 ESP32 项目",
  description: "提交一个公开 GitHub 仓库，经人工审核后收录进 ESP32 Atlas。",
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage() {
  const lang = await getLang();
  const rules =
    lang === "zh"
      ? [
          "必须是公开的 GitHub 仓库，且与 ESP32 生态相关。",
          "提交后进入人工审核队列，通过前不会出现在榜单里。",
          "我们不会因为提交而修改你仓库的任何内容。",
          "同一 IP 在 30 分钟内最多提交 5 次。",
        ]
      : [
          "Must be a public GitHub repository relevant to the ESP32 ecosystem.",
          "Submissions enter a human review queue and never appear in lists before approval.",
          "We never modify anything in your repository.",
          "A single IP may submit up to 5 times per 30 minutes.",
        ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <header className="surface p-5">
          <h1 className="text-xl font-semibold tracking-tight">{tr("submitTitle", lang)}</h1>
          <p className="muted mt-1.5 text-[0.85rem] leading-relaxed">{tr("submitIntro", lang)}</p>
        </header>
        <div className="mt-4">
          <SubmitForm lang={lang} />
        </div>
      </div>

      <aside className="surface h-fit p-4">
        <h2 className="mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
          {lang === "zh" ? "收录规则" : "Submission rules"}
        </h2>
        <ul className="mt-2 space-y-1.5">
          {rules.map((rule) => (
            <li key={rule} className="text-[0.79rem] leading-relaxed text-[var(--text-2)]">
              • {rule}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <h3 className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
            {lang === "zh" ? "审核标准" : "Review criteria"}
          </h3>
          <ul className="mt-1.5 space-y-1 text-[0.76rem] leading-relaxed text-[var(--text-2)]">
            {(lang === "zh"
              ? ["代码可构建或有可用固件", "有真实文档或教程", "近期仍在维护", "与 ESP32 相关，而非通用项目"]
              : ["Buildable code or flashable firmware", "Real documentation or a tutorial", "Still maintained recently", "ESP32 related rather than generic"]
            ).map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
