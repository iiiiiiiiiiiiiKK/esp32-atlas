"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function AdminActions({ lang, email }: { lang: Lang; email: string }) {
  const router = useRouter();
  const [syncState, setSyncState] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.refresh();
  }

  async function runSync() {
    setBusy(true);
    setSyncState(lang === "zh" ? "正在同步…" : "Syncing…");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        total?: number;
        updated?: number;
        failed?: number;
        rateLimited?: boolean;
      };
      if (res.ok && data.ok) {
        setSyncState(
          lang === "zh"
            ? `完成：${data.updated}/${data.total} 更新，${data.failed} 失败${data.rateLimited ? "（触发限流，剩余批次下次继续）" : ""}`
            : `Done: ${data.updated}/${data.total} updated, ${data.failed} failed${data.rateLimited ? " (rate limited — remaining batches continue next run)" : ""}`,
        );
        router.refresh();
      } else {
        setSyncState(
          data.error === "unauthorized"
            ? lang === "zh"
              ? "需要管理员权限。"
              : "Admin role required."
            : lang === "zh"
              ? `同步失败（${data.error ?? "unknown"}）`
              : `Sync failed (${data.error ?? "unknown"})`,
        );
      }
    } catch {
      setSyncState(lang === "zh" ? "网络错误。" : "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mono text-[0.68rem] text-[var(--text-2)]">{email}</span>
      <button type="button" className="btn btn-sm" onClick={runSync} disabled={busy} data-testid="run-sync">
        <RefreshCw size={12} aria-hidden /> {tr("runSync", lang)}
      </button>
      <button type="button" className="btn btn-sm btn-ghost" onClick={signOut} data-testid="admin-signout">
        <LogOut size={12} aria-hidden /> {tr("adminSignOut", lang)}
      </button>
      {syncState ? (
        <span className="pill pill-cyan" role="status">
          {syncState}
        </span>
      ) : null}
    </div>
  );
}
