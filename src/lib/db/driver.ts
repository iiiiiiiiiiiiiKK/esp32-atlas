/**
 * Minimal async SQL driver shared by Node (better local dev / scripts) and
 * Cloudflare D1 (production). The SQL surface used by the app is deliberately
 * small: placeholders are always `?`, results are plain objects.
 */

export type Row = Record<string, unknown>;

export interface SqlDriver {
  all<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  first<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T | null>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
  exec(sql: string): Promise<void>;
  kind: "d1" | "sqlite";
}

interface D1Result<T> {
  results?: T[];
  success?: boolean;
  meta?: { changes?: number };
}

interface D1PreparedLike {
  bind(...values: unknown[]): D1PreparedLike;
  all<T = Row>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<Row>>;
}

interface D1Like {
  prepare(sql: string): D1PreparedLike;
  exec(sql: string): Promise<unknown>;
}

export function d1Driver(db: D1Like): SqlDriver {
  return {
    kind: "d1",
    async all<T extends Row = Row>(sql: string, params: unknown[] = []) {
      const res = await db.prepare(sql).bind(...params).all<T>();
      return res.results ?? [];
    },
    async first<T extends Row = Row>(sql: string, params: unknown[] = []) {
      const rows = await this.all<T>(sql, params);
      return rows.length > 0 ? rows[0] : null;
    },
    async run(sql: string, params: unknown[] = []) {
      const res = await db.prepare(sql).bind(...params).run();
      return { changes: Number(res.meta?.changes ?? 0) };
    },
    async exec(sql: string) {
      await db.exec(sql);
    },
  };
}

type StatementSyncLike = {
  all(...params: unknown[]): Row[];
  run(...params: unknown[]): { changes: number | bigint };
};

type DatabaseSyncLike = {
  prepare(sql: string): StatementSyncLike;
  exec(sql: string): void;
};

export function sqliteDriver(db: DatabaseSyncLike): SqlDriver {
  return {
    kind: "sqlite",
    async all<T extends Row = Row>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
    async first<T extends Row = Row>(sql: string, params: unknown[] = []) {
      const rows = db.prepare(sql).all(...params) as T[];
      return rows.length > 0 ? rows[0] : null;
    },
    async run(sql: string, params: unknown[] = []) {
      const res = db.prepare(sql).run(...params);
      return { changes: Number(res.changes) };
    },
    async exec(sql: string) {
      db.exec(sql);
    },
  };
}

/**
 * Normalises values for SQLite bindings: D1 rejects `undefined`, and node:sqlite
 * rejects booleans/dates. Everything is stored as TEXT or INTEGER.
 */
export function bindable(values: unknown[]): unknown[] {
  return values.map((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "object") return JSON.stringify(v);
    return v;
  });
}
