"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; fullName: string }
  | { kind: "error"; code: string; message: string };

const ERROR_COPY: Record<string, { zh: string; en: string }> = {
  "invalid-github-url": { zh: "只接受 https://github.com/owner/repo 形式的公开仓库地址。", en: "Only public https://github.com/owner/repo URLs are accepted." },
  "repo-not-found": { zh: "GitHub 上找不到这个仓库（可能拼写错误或它是私有仓库）。", en: "GitHub could not find that repository (typo, or it is private)." },
  "repo-archived": { zh: "该仓库已归档，不接受提交。", en: "That repository is archived, so it cannot be listed." },
  duplicate: { zh: "这个仓库已经在站点里了。", en: "This repository is already listed." },
  "already-pending": { zh: "这个仓库已在审核队列中。", en: "This repository is already in the review queue." },
  "rate-limited": { zh: "提交过于频繁，请稍后再试。", en: "Too many submissions — please retry later." },
  "invalid-input": { zh: "请检查输入格式。", en: "Please check the input format." },
  "network-error": { zh: "无法连接 GitHub，请稍后重试。", en: "Could not reach GitHub — try again later." },
};

export function SubmitForm({ lang }: { lang: Lang }) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url, note }),
      });
      const data = (await res.json()) as { ok?: boolean; fullName?: string; error?: string; slug?: string };
      if (res.ok && data.ok) {
        setState({ kind: "ok", fullName: data.fullName ?? url });
        setUrl("");
        setNote("");
      } else {
        const code = data.error ?? "unknown";
        const copy = ERROR_COPY[code];
        setState({
          kind: "error",
          code,
          message: copy ? copy[lang] : lang === "zh" ? `提交失败（${code}）` : `Submission failed (${code})`,
        });
      }
    } catch {
      setState({
        kind: "error",
        code: "network-error",
        message: ERROR_COPY["network-error"][lang],
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface space-y-3 p-4" data-testid="submit-form">
      <div>
        <label htmlFor="repo-url" className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
          {tr("repoUrl", lang)}
        </label>
        <input
          id="repo-url"
          name="repoUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="field mt-1"
          required
          autoComplete="off"
          spellCheck={false}
          data-testid="submit-url"
        />
      </div>

      <div>
        <label htmlFor="repo-note" className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
          {tr("submitNote", lang)}
        </label>
        <textarea
          id="repo-note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          className="field mt-1 h-auto py-2"
          data-testid="submit-note"
        />
        <p className="mono mt-1 text-[0.64rem] text-[var(--text-2)]">{note.length}/500</p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={state.kind === "loading"} data-testid="submit-button">
        {state.kind === "loading" ? tr("loading", lang) : tr("submitButton", lang)}
      </button>

      <div aria-live="polite">
        {state.kind === "ok" ? (
          <p className="pill pill-brand" data-testid="submit-success">
            <CheckCircle2 size={11} aria-hidden /> {tr("submitSuccess", lang)}
          </p>
        ) : null}
        {state.kind === "error" ? (
          <p className="pill pill-danger" data-testid="submit-error">
            <AlertTriangle size={11} aria-hidden /> {state.message}
            {state.code === "duplicate" ? (
              <>
                {" "}
                <Link href="/explore" className="link">
                  {tr("navExplore", lang)}
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}
