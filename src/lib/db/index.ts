import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bindable, d1Driver, type Row, type SqlDriver } from "./driver";

interface D1BindingLike {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      all<T = Row>(): Promise<{ results?: T[] }>;
      run(): Promise<{ meta?: { changes?: number } }>;
    };
  };
  exec(sql: string): Promise<unknown>;
}

let cached: SqlDriver | null = null;

/**
 * Resolves the SQL driver for the current request.
 *
 * Production / `next dev`: Cloudflare D1 binding `DB` (locally emulated by
 * miniflare through the platform proxy). Nothing else is used in app code, so
 * the bundle stays compatible with the Workers runtime.
 */
export async function getDb(): Promise<SqlDriver> {
  if (cached) return cached;
  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as unknown as { DB?: D1BindingLike }).DB;
  if (!binding) {
    throw new Error(
      "D1 binding `DB` is missing. Run `npm run db:migrate:local` and make sure wrangler.jsonc declares the binding.",
    );
  }
  cached = d1Driver(binding as never) as SqlDriver;
  return cached;
}

export function resetDbCache(): void {
  cached = null;
}

export async function query<T extends Row = Row>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = await getDb();
  return db.all<T>(sql, bindable(params));
}

export async function first<T extends Row = Row>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const db = await getDb();
  return db.first<T>(sql, bindable(params));
}

export async function mutate(sql: string, params: unknown[] = []): Promise<number> {
  const db = await getDb();
  const res = await db.run(sql, bindable(params));
  return res.changes;
}

export { bindable };
export type { SqlDriver, Row };
