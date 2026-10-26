"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function AdminLoginForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          data.error === "rate-limited"
            ? lang === "zh"
              ? "尝试次数过多，请十分钟后再试。"
              : "Too many attempts — retry in ten minutes."
            : lang === "zh"
              ? "邮箱或密码不正确。"
              : "Email or password is incorrect.",
        );
      }
    } catch {
      setError(lang === "zh" ? "网络错误，请重试。" : "Network error — please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface max-w-sm space-y-3 p-5" data-testid="admin-login-form">
      <h1 className="text-[1.05rem] font-semibold">{tr("adminLogin", lang)}</h1>
      <div>
        <label htmlFor="admin-email" className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
          {tr("adminEmail", lang)}
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mt-1"
          autoComplete="username"
          required
          data-testid="admin-email"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--text-2)]">
          {tr("adminPassword", lang)}
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field mt-1"
          autoComplete="current-password"
          required
          minLength={8}
          data-testid="admin-password"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={loading} data-testid="admin-submit">
        {loading ? tr("loading", lang) : tr("adminSignIn", lang)}
      </button>
      <div aria-live="polite">
        {error ? (
          <p className="pill pill-danger" data-testid="admin-error">
            {error}
          </p>
        ) : null}
      </div>
      <p className="muted text-[0.72rem] leading-relaxed">
        {lang === "zh"
          ? "管理员账号只会通过服务端脚本创建，站点上没有任何注册入口。"
          : "Admin accounts are created only by a server-side script; there is no sign-up form anywhere on the site."}
      </p>
    </form>
  );
}
