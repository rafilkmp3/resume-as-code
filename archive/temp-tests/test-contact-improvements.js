const puppeteer = require('puppeteer');

async function testContactImprovements() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 720 });
  
  // Test dark theme contact section
  console.log('📸 Testing dark theme contact section...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const contactSection = await page.$('#contact');
  if (contactSection) {
    await contactSection.screenshot({ 
      path: './visual-evidence/contact-improved-dark.png'
    });
    console.log('✅ Dark theme contact section saved');
  }
  
  // Test light theme contact section
  console.log('📸 Testing light theme contact section...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (contactSection) {
    await contactSection.screenshot({ 
      path: './visual-evidence/contact-improved-light.png'
    });
    console.log('✅ Light theme contact section saved');
  }
  
  // Test full page with theme toggle visible - light theme
  await page.screenshot({ 
    path: './visual-evidence/full-page-light-improved.png'
  });
  console.log('✅ Full page light theme saved');
  
  // Test full page with theme toggle visible - dark theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await page.screenshot({ 
    path: './visual-evidence/full-page-dark-improved.png'
  });
  console.log('✅ Full page dark theme saved');
  
  await browser.close();
  console.log('🎉 Contact improvements test completed');
}

testContactImprovements().catch(console.error);
