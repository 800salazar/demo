import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/demo/ia",
    reuseExistingServer: false,
    timeout: 120_000,
    // Deterministic integration tests: no model charges or external credentials.
    env: { AI_GATEWAY_API_KEY: "", AI_MODEL: "", VERCEL_OIDC_TOKEN: "", SUPABASE_SECRET_KEY: "" },
  },
});
