"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Download, Upload, AlertTriangle } from "lucide-react";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";
import {
  COLLECTIONS_EVENT,
  clearAll,
  exportJson,
  importJson,
  readAll,
  remove,
  update,
  type SavedItem,
  type SavedStatus,
} from "@/lib/collections";

const STATUS_LABEL: Record<SavedStatus, { zh: string; en: string }> = {
  todo: { zh: "未开始", en: "Not started" },
  doing: { zh: "进行中", en: "In progress" },
  done: { zh: "已完成", en: "Done" },
};

export function CollectionsClient({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setItems(readAll());
    sync();
    setReady(true);
    window.addEventListener(COLLECTIONS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COLLECTIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const grouped = useMemo(() => {
    return {
      repo: items.filter((i) => i.kind === "repo"),
      tutorial: items.filter((i) => i.kind === "tutorial"),
      path: items.filter((i) => i.kind === "path"),
    };
  }, [items]);

  function doExport() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esp32-atlas-collections-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(lang === "zh" ? "已导出 JSON 文件。" : "Exported the JSON file.");
  }

  async function doImport(file: File) {
    const text = await file.text();
    const result = importJson(text);
    setMessage(
      result.ok
        ? lang === "zh"
          ? `已导入 ${result.imported} 条记录。`
          : `Imported ${result.imported} items.`
        : lang === "zh"
          ? `导入失败：${result.error}`
          : `Import failed: ${result.error}`,
    );
    setItems(readAll());
  }

  return (
    <div className="space-y-4">
      <div className="surface flex flex-wrap items-center gap-2 p-3">
        <button type="button" className="btn btn-sm" onClick={doExport} disabled={items.length === 0}>
          <Download size={12} aria-hidden /> {tr("exportJson", lang)}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>
          <Upload size={12} aria-hidden /> {tr("importJson", lang)}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void doImport(file);
            e.target.value = "";
          }}
        />
        {items.length > 0 ? (
          <button
            type="button"
            className="btn btn-sm btn-ghost ml-auto"
            onClick={() => {
              if (window.confirm(lang === "zh" ? "确定清空本地清单？此操作不可撤销。" : "Clear the local list? This cannot be undone.")) {
                clearAll();
                setItems([]);
              }
            }}
          >
            <Trash2 size={12} aria-hidden /> {tr("clearAll", lang)}
          </button>
        ) : null}
        <span className="mono text-[0.68rem] text-[var(--text-2)]">
          {items.length} {lang === "zh" ? "条" : "items"}
        </span>
      </div>

      {message ? (
        <p className="pill pill-cyan" role="status">
          {message}
        </p>
      ) : null}

      {ready && items.length === 0 ? (
        <div className="surface px-6 py-12 text-center" data-testid="collections-empty">
          <h2 className="text-[0.95rem] font-semibold">{tr("emptyCollection", lang)}</h2>
          <p className="muted mt-1.5 text-[0.82rem]">{tr("emptyCollectionBody", lang)}</p>
          <Link href="/explore" className="btn mt-4">
            {tr("navExplore", lang)}
          </Link>
        </div>
      ) : null}

      {(["repo", "tutorial", "path"] as const).map((kind) => {
        const list = grouped[kind];
        if (list.length === 0) return null;
        return (
          <section key={kind} className="space-y-2">
            <h2 className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--text-2)]">
              {kind === "repo"
                ? lang === "zh" ? "项目" : "Projects"
                : kind === "tutorial"
                  ? lang === "zh" ? "教程" : "Tutorials"
                  : lang === "zh" ? "学习路线" : "Learning paths"}
            </h2>
            <ul className="space-y-2">
              {list.map((item) => (
                <li key={item.id} className="surface p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={item.href}
                        className="text-[0.86rem] font-medium hover:text-[var(--brand)]"
                        {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
                      >
                        {item.title}
                      </Link>
                      {item.subtitle ? <p className="muted truncate text-[0.74rem]">{item.subtitle}</p> : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="sr-only" htmlFor={`status-${item.id}`}>
                        {lang === "zh" ? "状态" : "Status"}
                      </label>
                      <select
                        id={`status-${item.id}`}
                        value={item.status}
                        onChange={(e) => {
                          update(item.id, { status: e.target.value as SavedStatus });
                          setItems(readAll());
                        }}
                        className="field h-8 w-[7.5rem] text-[0.75rem]"
                      >
                        {(["todo", "doing", "done"] as const).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s][lang]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          remove(item.id);
                          setItems(readAll());
                        }}
                        aria-label={tr("remove", lang)}
                      >
                        <Trash2 size={12} aria-hidden />
                      </button>
                    </div>
                  </div>
                  <label className="sr-only" htmlFor={`note-${item.id}`}>
                    {tr("note", lang)}
                  </label>
                  <textarea
                    id={`note-${item.id}`}
                    value={item.note}
                    onChange={(e) => {
                      update(item.id, { note: e.target.value });
                      setItems(readAll());
                    }}
                    placeholder={tr("note", lang)}
                    rows={2}
                    className="field mt-2 h-auto py-1.5 text-[0.78rem]"
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="flex items-start gap-1.5 rounded border border-[color-mix(in_srgb,var(--warn)_50%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] px-2.5 py-2 text-[0.74rem] leading-relaxed text-[var(--warn)]">
        <AlertTriangle size={11} className="mt-0.5 shrink-0" aria-hidden />
        {lang === "zh"
          ? "这些数据只存在当前浏览器，清除站点数据会丢失。请定期导出备份。"
          : "This data lives only in this browser. Clearing site data loses it — export a backup regularly."}
      </p>
    </div>
  );
}
