const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/fast-smoke.spec.js'],
  timeout: 30 * 1000, // Reduced timeout
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for fast tests
  workers: 1, // Single worker for speed
  reporter: 'dot', // Minimal reporting
  use: {
    headless: true,
    trace: 'off', // Disable tracing for speed
    screenshot: 'off', // Disable screenshots for speed
    video: 'off', // Disable videos for speed
  },
  projects: [
    // Only test desktop Chrome for fast smoke tests
    {
      name: 'fast-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: 'npm run serve:test',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 30 * 1000, // Reduced timeout
  },
});