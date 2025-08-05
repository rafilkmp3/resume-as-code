const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**'],
  timeout: 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '100%' : undefined,
  reporter: 'dot',
  use: {
    headless: true, // Force headless mode for CI compatibility
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers
    {
      name: 'desktop-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'desktop-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'desktop-webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    // Mobile browsers - Chrome/Chromium
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    // Mobile browsers - Firefox (emulated)
    {
      name: 'mobile-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 393, height: 851 }, // Pixel 5 viewport
        userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0',
        hasTouch: true,
      },
    },
    // Mobile browsers - WebKit/Safari
    {
      name: 'mobile-webkit',
      use: {
        ...devices['iPhone 13'],
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: process.env.CI ? 'PORT=3001 node scripts/server.js' : 'npm run serve:test',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});