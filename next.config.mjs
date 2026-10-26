/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/**
 * Makes the Cloudflare D1 binding available to `next dev` (via Miniflare).
 * Only initialised for the dev server: during `next build` it is unnecessary and
 * spawning workerd there just adds a failure mode.
 */
if (process.env.NEXT_PHASE !== "phase-production-build") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev({ persist: { path: ".wrangler/state/v3" } });
}