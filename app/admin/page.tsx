import type { Metadata } from "next";
import { getLang } from "@/lib/prefs";
import { tr } from "@/lib/i18n";
import { getCurrentAdmin, listPendingSubmissions } from "@/lib/admin";
import { getAdminCounts, getSyncJobs, listRepos } from "@/lib/repos";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminActions } from "@/components/admin-actions";
import { SubmissionReview } from "@/components/submission-review";
import { formatDate, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const lang = await getLang();
  const admin = await getCurrentAdmin();

  if (!admin) {
    return (
      <div className="space-y-4">
        <header className="surface p-5">
          <h1 className="text-xl font-semibold tracking-tight">{tr("adminTitle", lang)}</h1>
          <p className="muted mt-1.5 max-w-[70ch] text-[0.85rem] leading-relaxed">
            {lang === "zh"
              ? "此区域需要管理员身份。所有 /admin 页面与 /api/admin 接口都会在服务端校验会话，隐藏入口不是权限控制。"
              : "This area requires an admin account. Every /admin page and /api/admin route checks the session server-side — hiding an entry point is not access control."}
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <AdminLoginForm lang={lang} />
          <div className="surface p-4">
            <h2 className="mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
              {lang === "zh" ? "如何创建管理员" : "How to create an admin"}
            </h2>
            <pre className="mono mt-2 overflow-x-auto rounded border border-[var(--border)] bg-[var(--panel-2)] p-3 text-[0.72rem] leading-relaxed">
{`ADMIN_EMAIL=you@example.com \\
ADMIN_PASSWORD='a-long-password' \\
npm run admin:create`}
            </pre>
            <p className="muted mt-2 text-[0.76rem] leading-relaxed">
              {lang === "zh"
                ? "脚本会用 PBKDF2-SHA256（150k 次迭代）对密码做哈希后写入数据库；数据库中不保存明文密码。"
                : "The script hashes the password with PBKDF2-SHA256 (210k iterations) before writing it; plaintext passwords are never stored."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [counts, pending, jobs, repos] = await Promise.all([
    getAdminCounts(),
    listPendingSubmissions(),
    getSyncJobs(8),
    listRepos(1000),
  ]);
  const staleRepos = repos.filter((r) => r.syncStatus !== "ok");

  return (
    <div className="space-y-4">
      <header className="surface flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{tr("adminTitle", lang)}</h1>
          <p className="muted mt-1 text-[0.8rem]">
            {counts.published} {lang === "zh" ? "个已发布项目" : "published projects"} · {counts.tutorials}{" "}
            {lang === "zh" ? "条教程" : "tutorials"} · {pending.length} {lang === "zh" ? "条待审核" : "pending"}
          </p>
        </div>
        <AdminActions lang={lang} email={admin.email} />
      </header>

      <section className="surface p-4">
        <h2 className="mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">{tr("submissions", lang)}</h2>
        {pending.length === 0 ? (
          <p className="muted mt-2 text-[0.82rem]">
            {lang === "zh" ? "没有待审核的提交。" : "Nothing pending review."}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pending.map((sub) => (
              <SubmissionReview
                key={sub.id}
                lang={lang}
                id={sub.id}
                repoUrl={sub.repoUrl}
                fullName={sub.fullName}
                createdAt={sub.createdAt}
                note={typeof sub.note === "string" ? sub.note : null}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4">
          <h2 className="mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">{tr("syncStatus", lang)}</h2>
          {jobs.length === 0 ? (
            <p className="muted mt-2 text-[0.82rem]">{lang === "zh" ? "还没有同步记录。" : "No sync runs yet."}</p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--border)]">
              {jobs.map((job) => (
                <li key={String(job.id)} className="py-2">
                  <div className="flex flex-wrap items-center gap-2 text-[0.76rem]">
                    <span className="mono text-[var(--text-2)]">{formatDate(String(job.started_at), lang)}</span>
                    <span className="pill">{String(job.trigger)}</span>
                    <span
                      className={`pill ${job.status === "ok" ? "pill-brand" : job.status === "failed" ? "pill-danger" : "pill-warn"}`}
                    >
                      {String(job.status)}
                    </span>
                    <span className="mono text-[0.68rem] text-[var(--text-2)]">
                      {String(job.updated ?? 0)}/{String(job.total ?? 0)} · {String(job.failed ?? 0)} failed
                    </span>
                  </div>
                  {job.message ? (
                    <p className="muted mono mt-1 text-[0.68rem] leading-relaxed wrap-anywhere">{String(job.message)}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-4">
          <h2 className="mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">
            {lang === "zh" ? "同步异常" : "Sync problems"}
          </h2>
          {staleRepos.length === 0 ? (
            <p className="muted mt-2 text-[0.82rem]">
              {lang === "zh" ? "所有仓库最近一次同步都成功。" : "Every repository synced successfully last time."}
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--border)]">
              {staleRepos.map((repo) => (
                <li key={repo.id} className="py-2">
                  <div className="flex items-center justify-between gap-2 text-[0.78rem]">
                    <span className="truncate">{repo.fullName}</span>
                    <span className="pill pill-warn shrink-0">{repo.syncStatus}</span>
                  </div>
                  {repo.syncError ? (
                    <p className="muted mono mt-0.5 text-[0.68rem] wrap-anywhere">{repo.syncError}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="surface p-4">
        <h2 className="mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-2)]">{tr("curation", lang)}</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.78rem]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-2)]">
                <th scope="col" className="py-1.5 pr-3 font-normal">repo</th>
                <th scope="col" className="py-1.5 pr-3 font-normal">stars</th>
                <th scope="col" className="py-1.5 pr-3 font-normal">category</th>
                <th scope="col" className="py-1.5 pr-3 font-normal">difficulty</th>
                <th scope="col" className="py-1.5 pr-3 font-normal">doc</th>
                <th scope="col" className="py-1.5 pr-3 font-normal">demo</th>
                <th scope="col" className="py-1.5 font-normal">synced</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr key={repo.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-1.5 pr-3">{repo.fullName}</td>
                  <td className="mono py-1.5 pr-3">{formatNumber(repo.stars, lang)}</td>
                  <td className="py-1.5 pr-3">{repo.category ?? "—"}</td>
                  <td className="py-1.5 pr-3">{repo.difficulty ?? "—"}</td>
                  <td className="mono py-1.5 pr-3">{repo.docScore ?? "—"}</td>
                  <td className="mono py-1.5 pr-3">{repo.demoScore ?? "—"}</td>
                  <td className="mono py-1.5 text-[0.7rem] text-[var(--text-2)]">
                    {formatDate(repo.lastSyncedAt, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
