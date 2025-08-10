const { chromium } = require('playwright');

async function captureContactSection() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to contact section
    await page.evaluate(() => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Take screenshot of contact section
    await page.locator('#contact').screenshot({
      path: 'visual-evidence/contact-section-desktop.png'
    });
    console.log('✓ Desktop contact section screenshot saved');
    
    // Mobile viewport
    await page.setViewportSize({ width: 430, height: 932 });
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    await page.locator('#contact').screenshot({
      path: 'visual-evidence/contact-section-mobile.png'
    });
    console.log('✓ Mobile contact section screenshot saved');
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    process.exit(1);
  }
  
  await browser.close();
}

captureContactSection();
