/**
 * Creates or updates an admin account.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run admin:create -- --local
 *
 * - `--local`  writes to the local wrangler D1 emulation (.wrangler/state)
 * - `--remote` writes to the deployed D1 database (needs CLOUDFLARE_API_TOKEN)
 *
 * The password is hashed with PBKDF2-SHA256 (150k iterations, Web Crypto) before
 * it reaches the database; the plaintext is never written to disk or logs.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { hashPassword } from "../src/lib/password.ts";

const root = resolve(import.meta.dirname, "..");
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("ADMIN_EMAIL is missing or not a valid email address.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const hash = await hashPassword(password);
const remote = process.argv.includes("--remote");
const dbName = "esp32-atlas-db";
const sqlPath = resolve(root, ".tmp-admin.sql");

const escapedEmail = email.replace(/'/g, "''");
const statement =
  `INSERT INTO admin_users (email, password_hash, role, created_at) ` +
  `VALUES ('${escapedEmail}', '${hash}', 'admin', datetime('now')) ` +
  `ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash;\n`;
writeFileSync(sqlPath, statement, "utf8");

const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const args = [
  "d1",
  "execute",
  dbName,
  remote ? "--remote" : "--local",
  "--file",
  sqlPath,
  "-y",
  ...(remote ? [] : ["--persist-to", ".wrangler/state"]),
];

try {
  const output = execFileSync(process.execPath, [wrangler, ...args], { cwd: root, encoding: "utf8" });
  console.log(output.trim().split("\n").slice(-4).join("\n"));
  console.log(`admin account ready: ${email}`);
  console.log("migrations:", readdirSync(resolve(root, "migrations")).join(", "));
} catch (err) {
  console.error("Failed to write the admin account.");
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
} finally {
  try {
    unlinkSync(sqlPath);
  } catch {
    // best effort cleanup - the file holds only a hash, never the password
  }
}