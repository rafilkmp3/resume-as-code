#!/usr/bin/env node

/**
 * Header Layout Analysis - Capture screenshots and analyze header structure
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureHeaderLayouts() {
  console.log('🔍 Analyzing Header section layouts...');

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
    console.log('🖥️  Testing Desktop Header (1920x1080)...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    await desktopPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    // Wait for content to load
    await desktopPage.waitForSelector('.header', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture Header section specifically
    const headerSection = await desktopPage.$('.header');
    if (headerSection) {
      await headerSection.screenshot({
        path: `${screenshotsDir}/header-desktop-1920x1080.png`,
      });
      console.log('✅ Desktop header screenshot saved');
    }

    // Analyze header structure
    const headerAnalysis = await desktopPage.evaluate(() => {
      const header = document.querySelector('.header');
      if (!header) return { found: false };

      return {
        found: true,
        height: header.offsetHeight,
        width: header.offsetWidth,
        computedStyles: {
          display: window.getComputedStyle(header).display,
          flexDirection: window.getComputedStyle(header).flexDirection,
          justifyContent: window.getComputedStyle(header).justifyContent,
          alignItems: window.getComputedStyle(header).alignItems,
          padding: window.getComputedStyle(header).padding,
          margin: window.getComputedStyle(header).margin,
        },
        childElements: Array.from(header.children).map(child => ({
          className: child.className,
          tagName: child.tagName,
          textContent: child.textContent?.substring(0, 50) || '',
          offsetHeight: child.offsetHeight,
          offsetWidth: child.offsetWidth,
        })),
      };
    });

    console.log('📊 Desktop Header Analysis:');
    console.log(`   Size: ${headerAnalysis.width}x${headerAnalysis.height}px`);
    console.log(
      `   Layout: ${headerAnalysis.computedStyles.display}, ${headerAnalysis.computedStyles.flexDirection}`
    );
    console.log(`   Child elements: ${headerAnalysis.childElements.length}`);

    await desktopPage.close();

    // Test Tablet Layout
    console.log('📱 Testing Tablet Header (768x1024)...');
    const tabletPage = await browser.newPage();
    await tabletPage.setViewport({ width: 768, height: 1024 });
    await tabletPage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    await tabletPage.waitForSelector('.header', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const tabletHeaderSection = await tabletPage.$('.header');
    if (tabletHeaderSection) {
      await tabletHeaderSection.screenshot({
        path: `${screenshotsDir}/header-tablet-768x1024.png`,
      });
      console.log('✅ Tablet header screenshot saved');
    }

    await tabletPage.close();

    // Test iPhone Pro Max Layout
    console.log('📱 Testing iPhone 15 Pro Max Header (430x932)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 430, height: 932 });
    await mobilePage.goto(`file://${path.resolve('./dist/index.html')}`, {
      waitUntil: 'networkidle0',
    });

    await mobilePage.waitForSelector('.header', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mobileHeaderSection = await mobilePage.$('.header');
    if (mobileHeaderSection) {
      await mobileHeaderSection.screenshot({
        path: `${screenshotsDir}/header-iphone-pro-max-430x932.png`,
      });
      console.log('✅ iPhone Pro Max header screenshot saved');
    }

    // Analyze mobile header responsiveness
    const mobileHeaderAnalysis = await mobilePage.evaluate(() => {
      const header = document.querySelector('.header');
      if (!header) return { found: false };

      const profilePhoto =
        header.querySelector('.profile-photo') ||
        header.querySelector('[alt*="profile"]');
      const name = header.querySelector('h1') || header.querySelector('.name');
      const title =
        header.querySelector('.title') || header.querySelector('h2');
      const contact = header.querySelector('.contact-info');

      return {
        found: true,
        height: header.offsetHeight,
        width: header.offsetWidth,
        elements: {
          profilePhoto: profilePhoto
            ? {
                width: profilePhoto.offsetWidth,
                height: profilePhoto.offsetHeight,
                display: window.getComputedStyle(profilePhoto).display,
              }
            : null,
          name: name
            ? {
                fontSize: window.getComputedStyle(name).fontSize,
                lineHeight: window.getComputedStyle(name).lineHeight,
                textContent: name.textContent,
              }
            : null,
          title: title
            ? {
                fontSize: window.getComputedStyle(title).fontSize,
                textContent: title.textContent,
              }
            : null,
          contact: contact
            ? {
                display: window.getComputedStyle(contact).display,
                children: contact.children.length,
              }
            : null,
        },
      };
    });

    console.log('📊 Mobile Header Analysis:');
    console.log(
      `   Size: ${mobileHeaderAnalysis.width}x${mobileHeaderAnalysis.height}px`
    );
    if (mobileHeaderAnalysis.elements.profilePhoto) {
      console.log(
        `   Profile photo: ${mobileHeaderAnalysis.elements.profilePhoto.width}x${mobileHeaderAnalysis.elements.profilePhoto.height}px`
      );
    }
    if (mobileHeaderAnalysis.elements.name) {
      console.log(
        `   Name font: ${mobileHeaderAnalysis.elements.name.fontSize}`
      );
    }

    await mobilePage.close();

    console.log('🎉 Header analysis complete!');
    console.log(`📂 Screenshots saved in: ${screenshotsDir}/`);
    console.log('🔍 Review screenshots to identify improvement opportunities');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  captureHeaderLayouts().catch(error => {
    console.error('❌ Failed to capture header layouts:', error);
    process.exit(1);
  });
}

module.exports = { captureHeaderLayouts };
