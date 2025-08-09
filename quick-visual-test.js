const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureScreenshots() {
  console.log('📸 Taking screenshots of integrated counter...');

  // Create evidence directory
  const evidenceDir = path.join(
    __dirname,
    'visual-evidence',
    'integrated-counter'
  );
  await fs.mkdir(evidenceDir, { recursive: true });

  const browser = await chromium.launch();

  try {
    // iPhone 16 Pro Max screenshots
    const mobileContext = await browser.newContext({
      viewport: { width: 430, height: 932 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000');
    await mobilePage.waitForLoadState('networkidle');

    // Screenshot the new resume download section
    console.log('📸 Header with new download section...');
    await mobilePage.screenshot({
      path: path.join(evidenceDir, 'mobile_header_new_download.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 430, height: 600 },
    });

    // Screenshot the experience section with integrated counter
    console.log('📸 Experience section with integrated counter...');
    await mobilePage.locator('#experience-section').screenshot({
      path: path.join(evidenceDir, 'mobile_experience_integrated_counter.png'),
    });

    // Full page screenshot
    await mobilePage.screenshot({
      path: path.join(evidenceDir, 'mobile_full_page.png'),
      fullPage: true,
    });

    await mobileContext.close();

    console.log('✅ Screenshots saved to:', evidenceDir);
  } catch (error) {
    console.error('❌ Screenshot error:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
