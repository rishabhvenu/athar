import { defineConfig, devices } from "@playwright/test";

const appPort = 3000;
const supabaseMockPort = 54321;
const baseURL = `http://127.0.0.1:${appPort}`;
const supabaseURL = `http://127.0.0.1:${supabaseMockPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `node tests/helpers/mock-supabase-server.mjs ${supabaseMockPort}`,
      url: `${supabaseURL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `pnpm dev --hostname 127.0.0.1 --port ${appPort}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseURL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-anon-key",
        GEMINI_API_KEY: "placeholder-gemini-key",
        NODE_OPTIONS: "--import=./tests/helpers/e2e-fetch-mock.mjs",
      },
    },
  ],
});
