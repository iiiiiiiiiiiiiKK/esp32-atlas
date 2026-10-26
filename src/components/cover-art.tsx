import type { RepoRecord } from "@/lib/types";

/** Deterministic hash so the same repo always renders the same art. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Generated cover art — no third-party images, so it can never 404 or hotlink.
 * Renders a PCB-like motif seeded by the repo name.
 */
export function CoverArt({
  repo,
  className = "",
  showLabel = true,
}: {
  repo: Pick<RepoRecord, "fullName" | "chips">;
  className?: string;
  showLabel?: boolean;
}) {
  const h = hash(repo.fullName);
  const hue = (h % 40) + 130; // green→cyan band only, keeps the brand feel
  const c1 = `hsl(${hue} 70% 62%)`;
  const c2 = `hsl(${(hue + 28) % 360} 64% 46%)`;
  const label = repo.fullName.split("/")[1] ?? repo.fullName;
  const dots: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < 9; i += 1) {
    const n = hash(`${repo.fullName}:${i}`);
    dots.push({ x: 8 + (n % 84), y: 8 + ((n >> 7) % 84), r: 1 + ((n >> 13) % 2) });
  }
  const traces = [0, 1, 2].map((i) => {
    const n = hash(`${repo.fullName}:t${i}`);
    return {
      y1: 20 + (n % 60),
      x2: 30 + (n % 55),
      y2: 20 + ((n >> 6) % 60),
    };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${label} cover art`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`g-${h}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--panel-2)" />
          <stop offset="100%" stopColor="var(--panel)" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${h})`} />
      <g stroke={c2} strokeWidth="0.35" opacity="0.5" fill="none">
        {traces.map((t, i) => (
          <path key={i} d={`M 4 ${t.y1} H ${t.x2} V ${t.y2} H 96`} />
        ))}
      </g>
      <g fill={c1} opacity="0.85">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} />
        ))}
      </g>
      <rect x="38" y="38" width="24" height="24" rx="2" fill="none" stroke={c1} strokeWidth="0.7" opacity="0.75" />
      <rect x="44" y="44" width="12" height="12" rx="1" fill={c1} opacity="0.18" />
      {showLabel ? (
        <text
          x="50"
          y="88"
          textAnchor="middle"
          fill="var(--text-2)"
          fontSize="5"
          fontFamily="ui-monospace, monospace"
          opacity="0.85"
        >
          {label.length > 18 ? `${label.slice(0, 17)}…` : label}
        </text>
      ) : null}
    </svg>
  );
}
