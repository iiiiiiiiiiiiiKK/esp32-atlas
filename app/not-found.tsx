import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-lg px-6 py-14 text-center">
      <p className="mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--text-2)]">404</p>
      <h1 className="mt-2 text-xl font-semibold">找不到这个页面</h1>
      <p className="muted mt-2 text-[0.84rem] leading-relaxed">
        This page does not exist — it may have moved, or the project is not indexed yet. 页面可能已被移动，或者这个项目尚未被收录。
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          回到首页 / Home
        </Link>
        <Link href="/explore" className="btn">
          探索项目 / Explore
        </Link>
      </div>
    </div>
  );
}
