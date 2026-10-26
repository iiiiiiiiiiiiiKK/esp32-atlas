import type { Lang } from "@/lib/types";

/**
 * Turns a raw driver/runtime error into a sentence a human can act on.
 *
 * The literal message is still shown, but inside a collapsed `<details>` — an
 * operator needs the exact text, while a visitor needs to know "is this my
 * fault, and when will it fix itself?".
 */
export interface ExplainedReason {
  /** One sentence, localised, no URLs. */
  summary: string;
  /** Optional second sentence with concrete numbers or next steps. */
  detail: string | null;
  /** Machine-ish tag, handy for tests and future analytics. */
  kind: "d1-quota" | "d1-unavailable" | "network" | "forced" | "unknown";
}

export function explainReason(reason: string | null, lang: Lang): ExplainedReason {
  const raw = reason ?? "";
  const zh = lang === "zh";

  if (/FORCE_DEGRADED|forced degraded/i.test(raw)) {
    return {
      kind: "forced",
      summary: zh
        ? "这是通过 FORCE_DEGRADED 开关手动模拟的降级模式（用于自检，不是真实故障）。"
        : "This is a manually simulated outage via the FORCE_DEGRADED switch (QA only, not a real fault).",
      detail: null,
    };
  }

  if (/exceeded D1'?s free tier daily row read limit|daily row read limit/i.test(raw)) {
    return {
      kind: "d1-quota",
      summary: zh
        ? "Cloudflare D1 免费额度中「每日行读取」已用尽（上限 500 万行/天，UTC 零点重置）。"
        : "Cloudflare D1's free-tier daily row-read limit is exhausted (5 million rows/day, resets at 00:00 UTC).",
      detail: zh
        ? "额度按账号计算，同一账号下其他项目的读取也会占用。UTC 零点后自动恢复实时数据；如需不再中断，可升级 D1 付费计划或降低其他项目的读取量。"
        : "The quota is per account, so other projects on the same account consume it too. Live data returns automatically after 00:00 UTC; to stop this recurring, upgrade the D1 plan or reduce read volume in the other projects.",
    };
  }

  if (/D1_ERROR|D1 database|d1-api/i.test(raw)) {
    return {
      kind: "d1-unavailable",
      summary: zh ? "数据库查询失败，具体错误见下方技术详情。" : "The database query failed — see the technical detail below.",
      detail: zh
        ? "页面已自动切换到构建时快照，功能仍可用；数据库恢复后会自动切回实时数据。"
        : "The page fell back to the build-time snapshot, so it still works; it switches back to live data automatically.",
    };
  }

  if (/fetch failed|ECONNRESET|ETIMEDOUT|network/i.test(raw)) {
    return {
      kind: "network",
      summary: zh ? "无法连接数据库（网络错误）。" : "Could not reach the database (network error).",
      detail: zh ? "这通常是暂时性的，刷新即可恢复。" : "This is usually transient — reloading recovers it.",
    };
  }

  return {
    kind: "unknown",
    summary: zh ? "数据服务暂时不可用。" : "The data service is temporarily unavailable.",
    detail: zh
      ? "页面已切换到构建时快照，功能仍可用。原始错误保留在技术详情中便于排查。"
      : "The page fell back to the build-time snapshot and still works. The raw error is kept under technical detail for debugging.",
  };
}
