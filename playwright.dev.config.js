import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially to fail fast
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for fast feedback
  workers: 1, // Single worker for fail-fast behavior
  reporter: 'list',
  timeout: 10000, // 10 second timeout for faster feedback
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  // Improved file naming for test results
  outputDir: 'test-results',
  testIdAttribute: 'data-testid',
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npx serve dist -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});