const puppeteer = require('puppeteer');

async function testBlurIssue() {
  console.log('📸 Testing blur effect on location badge...');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Desktop view - focus on header
  await page.setViewport({ width: 1280, height: 720 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Take close-up screenshot of just the location badge
  const locationBadge = await page.$('.header-location');
  if (locationBadge) {
    // Get the bounding box and add some padding
    const box = await locationBadge.boundingBox();
    await page.screenshot({
      path: './visual-evidence/location-badge-closeup-desktop.png',
      clip: {
        x: box.x - 20,
        y: box.y - 20,
        width: box.width + 40,
        height: box.height + 40
      }
    });
    console.log('📸 Desktop location badge closeup saved');
  }

  // Mobile view - focus on header
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (locationBadge) {
    const box = await locationBadge.boundingBox();
    await page.screenshot({
      path: './visual-evidence/location-badge-closeup-mobile.png',
      clip: {
        x: box.x - 20,
        y: box.y - 20,
        width: box.width + 40,
        height: box.height + 40
      }
    });
    console.log('📸 Mobile location badge closeup saved');
  }

  // Full header for context - desktop
  await page.setViewport({ width: 1280, height: 720 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const header = await page.$('.header');
  if (header) {
    await header.screenshot({
      path: './visual-evidence/full-header-blur-test-desktop.png'
    });
    console.log('📸 Full header desktop saved');
  }

  // Full header for context - mobile
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (header) {
    await header.screenshot({
      path: './visual-evidence/full-header-blur-test-mobile.png'
    });
    console.log('📸 Full header mobile saved');
  }

  await browser.close();
  console.log('✅ Blur effect test completed');
}

testBlurIssue().catch(console.error);
