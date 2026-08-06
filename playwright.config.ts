import { defineConfig, devices } from "@playwright/test";

/**
 * Browser E2E — skill: playwright-e2e-testing.
 * Pin @playwright/test ~1.48 on macOS 13 (Ventura) arm64; newer builds drop that host.
 * Serves `next start` on 3001 so a local `next dev` on 3000 can keep running.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      GYM_SAAS_E2E_FIXTURES: "1",
    },
  },
});
