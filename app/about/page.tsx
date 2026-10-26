import type { Metadata } from "next";
import { getLang } from "@/lib/prefs";

export const metadata: Metadata = {
  title: "关于 ESP32 Atlas 与数据说明",
  description: "数据来源、核验流程、推荐规则、已知限制与开源许可说明。",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const lang = await getLang();
  const zh = lang === "zh";

  return (
    <article className="surface space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">
          {zh ? "关于 ESP32 Atlas" : "About ESP32 Atlas"}
        </h1>
        <p className="muted mt-2 max-w-[78ch] text-[0.86rem] leading-relaxed">
          {zh
            ? "ESP32 Atlas 是一个独立社区项目，把 ESP32 生态里散落的仓库、教程与芯片资料整理成可比较、可追溯的目录。我们不与 Espressif Systems 有任何隶属关系。"
            : "ESP32 Atlas is an independent community project that turns scattered ESP32 repositories, tutorials and chip references into a comparable, traceable catalogue. It is not affiliated with Espressif Systems."}
        </p>
      </header>

      <Section title={zh ? "数据从哪来" : "Where the data comes from"}>
        <ul className="space-y-1.5 text-[0.83rem] leading-relaxed">
          <li>
            •{" "}
            {zh
              ? "Stars / Forks / Open Issues / pushed_at / 最新 Release：来自 GitHub REST API，服务端定时同步并写库缓存，页面渲染不直接请求 GitHub。"
              : "Stars, forks, open issues, pushed_at and latest release come from the GitHub REST API. A server-side job syncs and caches them; page renders never call GitHub directly."}
          </li>
          <li>
            •{" "}
            {zh
              ? "项目类别、难度、文档完整度、演示可用度、指南文本：人工编辑，与仓库指标分开存储，同步任务不会覆盖它们。"
              : "Category, difficulty, documentation quality, demo usability and guide text are editorial. They are stored apart from repo metrics, so sync jobs cannot overwrite them."}
          </li>
          <li>
            •{" "}
            {zh
              ? "教程条目只保存标题、一句话学习目标与原始链接，不复制第三方正文。每条都带最后核验时间。"
              : "Tutorial entries store only a title, a one-line learning goal and the original link — never a copy of third-party text. Each carries a last-verified date."}
          </li>
          <li>
            •{" "}
            {zh
              ? "芯片规格参考 Espressif 官方产品页与 ESP-IDF 文档；无法确认的字段明确标记「待核验」。"
              : "Chip specs reference Espressif product pages and ESP-IDF documentation. Anything we could not confirm is explicitly flagged as unverified."}
          </li>
        </ul>
      </Section>

      <Section title={zh ? "星标增长为什么常常显示「积累中」" : "Why star growth often says “accumulating”"}>
        <p className="text-[0.83rem] leading-relaxed">
          {zh
            ? "我们记录每次同步时点的星标值作为快照。只有当某个仓库存在足够久的历史快照时，才计算 7/30/90 天增长。没有快照就没有增长数字——我们不会用总星标或第三方估算冒充增长速度。"
            : "Each sync writes a star count snapshot. Growth over 7/30/90 days is computed only when a repository has a snapshot old enough. Without history there is no number — we will not dress total stars or third-party estimates up as growth."}
        </p>
      </Section>

      <Section title={zh ? "推荐排序规则" : "How recommendations are ranked"}>
        <p className="text-[0.83rem] leading-relaxed">
          {zh
            ? "综合推荐分 = 近期活跃度（最高 30）+ log10(Stars) 上限 25 + 文档完整度（最高 12）+ 演示可用度（最高 8）+ 新手友好 8 + 近期发版 6 + 编辑推荐 6 + 关键词命中（每个 14）。已归档仓库扣 30 分。总星标永远不是唯一依据，你可以随时切换为「Stars 总量」排序。"
            : "Composite score = recency (max 30) + log10(stars) capped at 25 + documentation (max 12) + demo usability (max 8) + beginner fit 8 + recent release 6 + editorial pick 6 + keyword hits (14 each). Archived repos lose 30. Total stars are never the only signal, and you can always switch to plain “Total stars” sorting."}
        </p>
      </Section>

      <Section title={zh ? "已知限制" : "Known limitations"}>
        <ul className="space-y-1.5 text-[0.83rem] leading-relaxed">
          <li>• {zh ? "搜索是关键词与标签匹配，不是语义检索。" : "Search is keyword and tag matching, not semantic retrieval."}</li>
          <li>• {zh ? "收藏仅保存在浏览器本地，没有账号与云同步。" : "Saved items live in browser storage only — there are no accounts or cloud sync."}</li>
          <li>• {zh ? "收录范围是有意精选的，不是全量 ESP32 仓库目录。" : "The catalogue is intentionally curated, not an exhaustive index of every ESP32 repository."}</li>
          <li>• {zh ? "没有 GitHub Token 时受匿名限流约束（60 次/小时），同步会分批进行。" : "Without a GitHub token, syncing is bound by the anonymous 60 req/h limit and runs in batches."}</li>
        </ul>
      </Section>

      <Section title={zh ? "许可与联系方式" : "License and contact"}>
        <p className="text-[0.83rem] leading-relaxed">
          {zh
            ? "本站代码以 MIT 许可开源。收录的第三方项目与教程版权归各自作者所有，本站仅提供链接与编辑性描述。"
            : "The site code is MIT licensed. Third-party projects and tutorials remain the property of their authors; we provide links and editorial descriptions only."}{" "}
          <a href="https://x.com/0xkillcoin" target="_blank" rel="noopener noreferrer" className="link">
            X / @0xkillcoin
          </a>
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-2)]">{title}</h2>
      <div className="mt-2 border-l border-[var(--border)] pl-3">{children}</div>
    </section>
  );
}
