"use client";

/**
 * Collections live entirely in localStorage (no account required).
 * The UI states this explicitly; export/import is the migration path.
 */

export type SavedKind = "repo" | "tutorial" | "path";
export type SavedStatus = "todo" | "doing" | "done";

export interface SavedItem {
  id: string;
  kind: SavedKind;
  title: string;
  href: string;
  subtitle?: string;
  status: SavedStatus;
  note: string;
  savedAt: string;
}

const KEY = "esp32-atlas.collections.v1";
export const COLLECTIONS_EVENT = "esp32-atlas:collections";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readAll(): SavedItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedItem =>
        !!item && typeof item.id === "string" && typeof item.href === "string" && typeof item.kind === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: SavedItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(COLLECTIONS_EVENT));
}

export function isSaved(id: string): boolean {
  return readAll().some((i) => i.id === id);
}

export function toggle(item: Omit<SavedItem, "status" | "note" | "savedAt">): boolean {
  const items = readAll();
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    writeAll(items.filter((i) => i.id !== item.id));
    return false;
  }
  writeAll([...items, { ...item, status: "todo", note: "", savedAt: new Date().toISOString() }]);
  return true;
}

export function update(id: string, patch: Partial<Pick<SavedItem, "status" | "note">>): void {
  writeAll(readAll().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function remove(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
}

export function clearAll(): void {
  writeAll([]);
}

export function exportJson(): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items: readAll() }, null, 2);
}

export function importJson(raw: string): { ok: boolean; imported: number; error?: string } {
  try {
    const parsed = JSON.parse(raw);
    const incoming: unknown = Array.isArray(parsed) ? parsed : parsed?.items;
    if (!Array.isArray(incoming)) return { ok: false, imported: 0, error: "invalid-shape" };
    const valid = incoming.filter(
      (item): item is SavedItem =>
        !!item &&
        typeof (item as SavedItem).id === "string" &&
        typeof (item as SavedItem).href === "string" &&
        typeof (item as SavedItem).title === "string",
    );
    const current = readAll();
    const map = new Map(current.map((i) => [i.id, i]));
    for (const item of valid) {
      map.set(item.id, {
        ...item,
        kind: item.kind ?? "repo",
        status: item.status ?? "todo",
        note: typeof item.note === "string" ? item.note : "",
        savedAt: item.savedAt ?? new Date().toISOString(),
      });
    }
    writeAll([...map.values()]);
    return { ok: true, imported: valid.length };
  } catch (err) {
    return { ok: false, imported: 0, error: err instanceof Error ? err.message : "parse-error" };
  }
}
