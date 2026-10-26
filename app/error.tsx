"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="surface mx-auto max-w-lg px-6 py-14 text-center">
      <h1 className="text-xl font-semibold">出错了 / Something went wrong</h1>
      <p className="muted mt-2 text-[0.84rem] leading-relaxed">
        页面渲染失败。可能是数据服务暂时不可用，请重试。The page failed to render — the data service may be temporarily
        unavailable.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={reset}>
          重试 / Retry
        </button>
        <Link href="/" className="btn">
          回到首页 / Home
        </Link>
      </div>
    </div>
  );
}
