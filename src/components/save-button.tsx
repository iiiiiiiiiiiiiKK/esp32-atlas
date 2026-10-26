"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { COLLECTIONS_EVENT, isSaved, toggle } from "@/lib/collections";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function SaveButton({
  id,
  kind,
  title,
  href,
  subtitle,
  lang,
  compact = false,
}: {
  id: string;
  kind: "repo" | "tutorial" | "path";
  title: string;
  href: string;
  subtitle?: string;
  lang: Lang;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(isSaved(id));
    setReady(true);
    const sync = () => setSaved(isSaved(id));
    window.addEventListener(COLLECTIONS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COLLECTIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggle({ id, kind, title, href, subtitle }));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={`btn ${compact ? "btn-sm" : ""} ${saved ? "pill-brand" : ""}`}
      style={saved ? { borderColor: "var(--brand)", color: "var(--brand)" } : undefined}
      data-testid={`save-${id}`}
      title={saved ? tr("savedProject", lang) : tr("saveProject", lang)}
    >
      {saved ? <BookmarkCheck size={14} aria-hidden /> : <Bookmark size={14} aria-hidden />}
      <span className={compact ? "sr-only" : ""}>
        {ready && saved ? tr("savedProject", lang) : tr("saveProject", lang)}
      </span>
    </button>
  );
}
