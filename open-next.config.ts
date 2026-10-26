import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Data is read straight from D1 on every request; the app is intentionally
  // dynamic (no ISR cache) so that editorial edits appear immediately.
  enableCacheInterception: false,
});
