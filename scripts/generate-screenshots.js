#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateScreenshots() {
  const browser = await chromium.launch();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '..', 'visual-evidence');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Desktop screenshot
    console.log('📱 Generating desktop screenshot...');
    const desktopPage = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });

    await desktopPage.goto('http://localhost:3000');
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000); // Extra wait for images to load

    await desktopPage.screenshot({
      path: path.join(screenshotsDir, 'desktop-verification.png'),
      fullPage: true
    });
    console.log('✅ Desktop screenshot saved');

    // Mobile screenshot (iPhone 15 Pro Max)
    console.log('📱 Generating mobile screenshot...');
    const mobilePage = await browser.newPage({
      viewport: { width: 430, height: 932 }
    });

    await mobilePage.goto('http://localhost:3000');
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000); // Extra wait for images to load

    await mobilePage.screenshot({
      path: path.join(screenshotsDir, 'mobile-verification.png'),
      fullPage: true
    });
    console.log('✅ Mobile screenshot saved');

    // Check for profile image presence
    const profileImageExists = await desktopPage.evaluate(() => {
      const img = document.querySelector('img[src*="profile"]');
      return img && img.complete && img.naturalWidth > 0;
    });

    // Check for QR code presence
    const qrCodeExists = await desktopPage.evaluate(() => {
      const qr = document.querySelector('img[src*="qr"], canvas[id*="qr"], svg[id*="qr"]');
      return qr !== null;
    });

    console.log(`\n🔍 Verification Results:`);
    console.log(`Profile Image: ${profileImageExists ? '✅ Loading' : '❌ Missing'}`);
    console.log(`QR Code: ${qrCodeExists ? '✅ Present' : '❌ Missing'}`);

  } catch (error) {
    console.error('❌ Screenshot generation failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  generateScreenshots().catch(console.error);
}

module.exports = { generateScreenshots };
