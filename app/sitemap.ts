import type { MetadataRoute } from "next";
import { listRepos, listPaths, listTutorials } from "@/lib/repos";

const BASE = process.env.SITE_URL ?? "https://esp32-atlas.changyuansex.workers.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/explore",
    "/paths",
    "/tutorials",
    "/hardware",
    "/radar",
    "/about",
    "/submit",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [repos, paths, tutorials] = await Promise.all([listRepos(1000), listPaths(), listTutorials()]);
    return [
      ...staticRoutes,
      ...repos.map((r) => ({
        url: `${BASE}/projects/${r.slug}`,
        lastModified: r.lastSyncedAt ? new Date(r.lastSyncedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...paths.map((p) => ({
        url: `${BASE}/paths/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...tutorials.slice(0, 200).map((t) => ({
        url: `${BASE}/tutorials?q=${encodeURIComponent(t.slug)}`,
        lastModified: t.verifiedAt ? new Date(t.verifiedAt) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
    ];
  } catch {
    // If the database is unavailable we still return the static map.
    return staticRoutes;
  }
}
