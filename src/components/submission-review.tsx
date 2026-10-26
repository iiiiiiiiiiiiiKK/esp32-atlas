"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function SubmissionReview({
  lang,
  id,
  repoUrl,
  fullName,
  createdAt,
  note,
}: {
  lang: Lang;
  id: number;
  repoUrl: string;
  fullName: string | null;
  createdAt: string;
  note: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setMsg(lang === "zh" ? "已处理" : "Handled");
        router.refresh();
      } else {
        setMsg(
          data.error === "unauthorized"
            ? lang === "zh"
              ? "无权限"
              : "Not authorised"
            : lang === "zh"
              ? `失败（${data.error ?? "unknown"}）`
              : `Failed (${data.error ?? "unknown"})`,
        );
      }
    } catch {
      setMsg(lang === "zh" ? "网络错误" : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded border border-[var(--border)] bg-[var(--panel-2)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-[0.83rem] font-medium hover:text-[var(--brand)]"
          >
            {fullName ?? repoUrl}
          </a>
          <p className="mono text-[0.66rem] text-[var(--text-2)]">
            #{id} · {createdAt.slice(0, 10)}
          </p>
          {note ? <p className="muted mt-1 text-[0.76rem] leading-relaxed">{note}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" className="btn btn-sm" onClick={() => act("approve")} disabled={busy}>
            <Check size={11} aria-hidden /> {tr("approve", lang)}
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => act("reject")} disabled={busy}>
            <X size={11} aria-hidden /> {tr("reject", lang)}
          </button>
        </div>
      </div>
      {msg ? (
        <p className="pill pill-cyan mt-1.5" role="status">
          {msg}
        </p>
      ) : null}
    </li>
  );
}
