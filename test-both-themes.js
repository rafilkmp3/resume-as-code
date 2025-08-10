const puppeteer = require('puppeteer');

async function testBothThemes() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 720 });
  
  // Test light theme
  console.log('📸 Testing light theme...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const header = await page.$('.header');
  if (header) {
    await header.screenshot({ 
      path: './visual-evidence/theme-light-header.png'
    });
    console.log('✅ Light theme header saved');
  }
  
  const locationBadge = await page.$('.header-location');
  if (locationBadge) {
    const box = await locationBadge.boundingBox();
    await page.screenshot({
      path: './visual-evidence/theme-light-location.png',
      clip: {
        x: box.x - 20,
        y: box.y - 20,
        width: box.width + 40,
        height: box.height + 40
      }
    });
    console.log('✅ Light theme location badge saved');
  }
  
  // Test dark theme
  console.log('📸 Testing dark theme...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (header) {
    await header.screenshot({ 
      path: './visual-evidence/theme-dark-header.png'
    });
    console.log('✅ Dark theme header saved');
  }
  
  if (locationBadge) {
    const box = await locationBadge.boundingBox();
    await page.screenshot({
      path: './visual-evidence/theme-dark-location.png',
      clip: {
        x: box.x - 20,
        y: box.y - 20,
        width: box.width + 40,
        height: box.height + 40
      }
    });
    console.log('✅ Dark theme location badge saved');
  }
  
  await browser.close();
  console.log('🎉 Both themes tested successfully');
}

testBothThemes().catch(console.error);
