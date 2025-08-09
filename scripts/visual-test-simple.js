#!/usr/bin/env node

// Simple visual testing script to capture basic screenshots
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class SimpleVisualTester {
  constructor() {
    this.screenshotDir = path.join(__dirname, '..', 'visual-evidence');
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting test server...');

    return new Promise((resolve, reject) => {
      // Check if port is already in use
      const testConnection = require('net').createConnection(3001, 'localhost');

      testConnection.on('connect', () => {
        testConnection.end();
        console.log('✅ Server already running on port 3001');
        resolve();
      });

      testConnection.on('error', () => {
        // Port is free, start server
        this.serverProcess = spawn('npm', ['run', 'serve:test'], {
          cwd: path.join(__dirname, '..'),
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        let serverReady = false;

        this.serverProcess.stdout.on('data', data => {
          const output = data.toString();
          if (output.includes('3001') && !serverReady) {
            serverReady = true;
            console.log('✅ Test server started');
            setTimeout(resolve, 2000);
          }
        });

        setTimeout(() => {
          if (!serverReady) {
            console.log('⏱️  Server timeout, continuing...');
            resolve();
          }
        }, 10000);
      });
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
      console.log('🛑 Server stopped');
    }
  }

  async captureScreenshots() {
    console.log('📸 SIMPLE VISUAL TESTING');
    console.log('========================');

    // Ensure directories exist
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    const deviceDirs = ['iphone-16-pro-max', 'macos-retina'];
    deviceDirs.forEach(dir => {
      const fullPath = path.join(this.screenshotDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    await this.startServer();

    const browser = await chromium.launch();

    try {
      // iPhone 16 Pro Max screenshots
      await this.captureDeviceScreenshots(browser, {
        name: 'iPhone 16 Pro Max',
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3,
        directory: 'iphone-16-pro-max',
      });

      // macOS Retina screenshots
      await this.captureDeviceScreenshots(browser, {
        name: 'macOS Retina Desktop',
        viewport: { width: 2560, height: 1600 },
        deviceScaleFactor: 2,
        directory: 'macos-retina',
      });

      console.log('\n✅ All screenshots captured successfully!');
      console.log(`📁 Screenshots saved to: ${this.screenshotDir}`);
    } finally {
      await browser.close();
      await this.stopServer();
    }
  }

  async captureDeviceScreenshots(browser, device) {
    console.log(`\n📱 Capturing ${device.name} screenshots...`);

    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
    });

    const page = await context.newPage();

    try {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

      // Light mode full page
      await page.screenshot({
        path: path.join(
          this.screenshotDir,
          device.directory,
          'light_fullpage.png'
        ),
        fullPage: true,
      });
      console.log(`  ✅ Light mode captured`);

      // Dark mode
      await page.evaluate(() => {
        document.body.classList.add('dark-mode');
        document.body.setAttribute('data-theme', 'dark');
      });
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(
          this.screenshotDir,
          device.directory,
          'dark_fullpage.png'
        ),
        fullPage: true,
      });
      console.log(`  ✅ Dark mode captured`);

      // Header section (light mode)
      await page.evaluate(() => {
        document.body.classList.remove('dark-mode');
        document.body.removeAttribute('data-theme');
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: path.join(
          this.screenshotDir,
          device.directory,
          'header_section.png'
        ),
        clip: {
          x: 0,
          y: 0,
          width: device.viewport.width,
          height: Math.min(600, device.viewport.height),
        },
      });
      console.log(`  ✅ Header section captured`);
    } finally {
      await context.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new SimpleVisualTester();

  tester.captureScreenshots().catch(error => {
    console.error('Visual testing failed:', error);
    process.exit(1);
  });
}

module.exports = SimpleVisualTester;
