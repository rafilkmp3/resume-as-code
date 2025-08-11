const puppeteer = require('puppeteer');
const fs = require('fs');

async function testLocationReadability() {
  console.log('📸 Testing Rio de Janeiro location readability...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Test both light and dark modes
  const modes = [
    { name: 'light', theme: 'light' },
    { name: 'dark', theme: 'dark' }
  ];
  
  for (const mode of modes) {
    console.log(`📱 Testing ${mode.name} mode...`);
    
    // Set theme
    await page.evaluate((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
    }, mode.theme);
    
    await page.waitForTimeout(500);
    
    // Mobile screenshot
    await page.setViewport({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    // Focus on header area
    const headerElement = await page.$('.header');
    if (headerElement) {
      await headerElement.screenshot({ 
        path: `./visual-evidence/location-${mode.name}-mobile-header.png`,
        clip: await headerElement.boundingBox()
      });
      console.log(`📸 Saved: location-${mode.name}-mobile-header.png`);
    }
    
    // Desktop screenshot  
    await page.setViewport({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    if (headerElement) {
      await headerElement.screenshot({ 
        path: `./visual-evidence/location-${mode.name}-desktop-header.png`,
        clip: await headerElement.boundingBox()
      });
      console.log(`📸 Saved: location-${mode.name}-desktop-header.png`);
    }
  }
  
  await browser.close();
  console.log('✅ Location readability test completed');
}

testLocationReadability().catch(console.error);
