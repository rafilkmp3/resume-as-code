#!/usr/bin/env node

/**
 * Simple test to capture screenshots of Skills section layout
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureSkillsLayouts() {
  console.log('🔍 Testing Skills section layouts...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Ensure screenshots directory exists
    const screenshotsDir = './test-screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Test Desktop Layout
    console.log('📱 Testing Desktop (1920x1080)...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    await desktopPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await desktopPage.waitForSelector('.skill-tag', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture Skills section specifically
    const skillsSection = await desktopPage.$('.right-column');
    if (skillsSection) {
      await skillsSection.screenshot({
        path: `${screenshotsDir}/skills-desktop-1920x1080.png`,
      });
      console.log('✅ Desktop screenshot saved');
    }

    // Check if pagination counter is hidden (should be on desktop)
    const counterVisible = await desktopPage.evaluate(() => {
      const counter = document.getElementById('skills-counter');
      return (
        counter &&
        counter.style.display !== 'none' &&
        window.getComputedStyle(counter).display !== 'none'
      );
    });
    console.log(
      `📊 Skills counter visible on desktop: ${counterVisible ? '❌ YES (should be hidden)' : '✅ NO (correct)'}`
    );

    await desktopPage.close();

    // Test iPhone Pro Max Layout
    console.log('📱 Testing iPhone 15 Pro Max (430x932)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 430, height: 932 });
    await mobilePage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await mobilePage.waitForSelector('.skill-tag', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture Skills section
    const mobileSkillsSection = await mobilePage.$('.right-column');
    if (mobileSkillsSection) {
      await mobileSkillsSection.screenshot({
        path: `${screenshotsDir}/skills-iphone-pro-max-430x932.png`,
      });
      console.log('✅ iPhone Pro Max screenshot saved');
    }

    // Check if pagination counter is visible (should be on mobile)
    const mobileCounterVisible = await mobilePage.evaluate(() => {
      const counter = document.getElementById('skills-counter');
      return (
        counter &&
        counter.style.display !== 'none' &&
        window.getComputedStyle(counter).display !== 'none'
      );
    });
    console.log(
      `📊 Skills counter visible on mobile: ${mobileCounterVisible ? '✅ YES (correct)' : '❌ NO (should be visible)'}`
    );

    await mobilePage.close();

    console.log('🎉 Skills section testing complete!');
    console.log(`📂 Screenshots saved in: ${screenshotsDir}/`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  captureSkillsLayouts().catch(error => {
    console.error('❌ Failed to capture layouts:', error);
    process.exit(1);
  });
}

module.exports = { captureSkillsLayouts };
