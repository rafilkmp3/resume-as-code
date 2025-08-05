const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**'],
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
      },
    },
    // Mobile browsers - Firefox
    {
      name: 'mobile-firefox',
      use: { 
        ...devices['Pixel 5'],
        channel: 'firefox',
      },
    },
    // Mobile browsers - WebKit/Safari
    {
      name: 'mobile-webkit',
      use: { 
        ...devices['iPhone 13'],
      },
    },
    // Legacy projects (keeping for compatibility)
    {
      name: 'iphone-15-pro-max',
      use: { ...devices['iPhone 15 Pro Max'] },
    },
    {
      name: 'ipad-pro',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      },
    },
  ],
  webServer: {
    command: process.env.CI ? 'PORT=3001 node server.js' : 'npm run serve:test',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});