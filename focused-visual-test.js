const puppeteer = require('puppeteer');

async function focusedVisualTest() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('🔍 Starting focused visual analysis...');
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 720 });
  
  // Test 1: Theme toggle in both states
  console.log('\n🎨 Testing theme toggle states...');
  
  const themes = ['light', 'dark'];
  for (const theme of themes) {
    await page.evaluate((theme) => {
      document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
    }, theme);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and screenshot theme toggle
    const themeToggle = await page.$('.theme-toggle, #darkToggle');
    if (themeToggle) {
      // Get the theme utility container for better context
      const themeUtility = await page.$('.theme-utility');
      const elementToCapture = themeUtility || themeToggle;
      
      await elementToCapture.screenshot({ 
        path: `./visual-evidence/theme-toggle-focused-${theme}.png`
      });
      console.log(`  ✅ Theme toggle ${theme} state captured`);
    }
  }
  
  // Test 2: Header with location badge in both themes
  console.log('\n🌍 Testing location badge readability...');
  
  for (const theme of themes) {
    await page.evaluate((theme) => {
      document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
    }, theme);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const header = await page.$('.header');
    if (header) {
      await header.screenshot({ 
        path: `./visual-evidence/header-location-${theme}.png`
      });
      console.log(`  ✅ Header with location ${theme} theme captured`);
    }
  }
  
  // Test 3: Section underlines by hovering
  console.log('\n📏 Testing section underlines...');
  
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', ''); // Light theme
  });
  
  const sections = await page.$$('.section');
  for (let i = 0; i < Math.min(sections.length, 4); i++) {
    const section = sections[i];
    
    // Get section name
    const h2 = await section.$('h2');
    if (h2) {
      const sectionName = await h2.evaluate(el => el.textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'));
      
      // Hover to trigger underline
      await section.hover();
      await new Promise(resolve => setTimeout(resolve, 700)); // Wait for animation
      
      await section.screenshot({ 
        path: `./visual-evidence/section-underline-${sectionName}.png`
      });
      console.log(`  ✅ Section underline captured: ${sectionName}`);
    }
  }
  
  // Test 4: Contact section detailed analysis
  console.log('\n📞 Testing contact section details...');
  
  for (const theme of themes) {
    await page.evaluate((theme) => {
      document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
    }, theme);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const contactSection = await page.$('#contact');
    if (contactSection) {
      await contactSection.screenshot({ 
        path: `./visual-evidence/contact-detailed-${theme}.png`
      });
      console.log(`  ✅ Contact section ${theme} theme captured`);
    }
  }
  
  // Test 5: Mobile responsiveness
  console.log('\n📱 Testing mobile layout...');
  
  await page.setViewport({ width: 375, height: 667 });
  
  for (const theme of themes) {
    await page.evaluate((theme) => {
      document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
    }, theme);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Full mobile screenshot
    await page.screenshot({ 
      path: `./visual-evidence/mobile-full-${theme}.png`,
      fullPage: true
    });
    
    // Mobile header
    const header = await page.$('.header');
    if (header) {
      await header.screenshot({ 
        path: `./visual-evidence/mobile-header-${theme}.png`
      });
    }
    
    // Mobile theme toggle
    const themeToggle = await page.$('.theme-toggle, #darkToggle');
    if (themeToggle) {
      await themeToggle.screenshot({ 
        path: `./visual-evidence/mobile-theme-toggle-${theme}.png`
      });
    }
    
    console.log(`  ✅ Mobile ${theme} theme layout captured`);
  }
  
  // Detailed analysis
  console.log('\n🔬 Running detailed component analysis...');
  
  await page.setViewport({ width: 1280, height: 720 });
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', '');
  });
  
  const analysis = await page.evaluate(() => {
    const results = {};
    
    // Theme toggle analysis
    const themeToggle = document.getElementById('darkToggle');
    if (themeToggle) {
      results.themeToggle = {
        textContent: themeToggle.textContent.trim(),
        hasOverflow: themeToggle.scrollWidth > themeToggle.clientWidth,
        svgIcons: themeToggle.querySelectorAll('svg').length,
        dimensions: {
          width: themeToggle.offsetWidth,
          height: themeToggle.offsetHeight
        },
        computedStyles: {
          overflow: getComputedStyle(themeToggle).overflow,
          textOverflow: getComputedStyle(themeToggle).textOverflow
        }
      };
    }
    
    // Calendly link analysis
    const calendlyLink = document.querySelector('a[href*="calendly"]');
    if (calendlyLink) {
      results.calendlyLink = {
        text: calendlyLink.textContent.trim(),
        href: calendlyLink.href,
        visible: calendlyLink.offsetWidth > 0 && calendlyLink.offsetHeight > 0,
        color: getComputedStyle(calendlyLink).color,
        parentContext: calendlyLink.closest('.contact-info')?.textContent.trim()
      };
    }
    
    // Section underline analysis
    const sections = document.querySelectorAll('.section h2');
    results.sectionUnderlines = Array.from(sections).map(h2 => {
      const afterStyles = getComputedStyle(h2, '::after');
      return {
        sectionTitle: h2.textContent.trim(),
        afterWidth: afterStyles.width,
        afterOpacity: afterStyles.opacity,
        parentWidth: h2.parentElement.offsetWidth
      };
    });
    
    // Contact section color analysis
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const labels = contactSection.querySelectorAll('.contact-label');
      const links = contactSection.querySelectorAll('.contact-link');
      
      results.contactColors = {
        labels: Array.from(labels).map(label => ({
          text: label.textContent.trim(),
          color: getComputedStyle(label).color,
          opacity: getComputedStyle(label).opacity
        })),
        links: Array.from(links).map(link => ({
          text: link.textContent.trim(),
          color: getComputedStyle(link).color,
          opacity: getComputedStyle(link).opacity
        }))
      };
    }
    
    return results;
  });
  
  console.log('\n📊 Component Analysis Results:');
  console.log('Theme Toggle:', analysis.themeToggle);
  console.log('Calendly Link:', analysis.calendlyLink);
  console.log('Section Underlines:', analysis.sectionUnderlines?.slice(0, 3));
  console.log('Contact Colors:', analysis.contactColors);
  
  await browser.close();
  console.log('\n✅ Focused visual testing completed!');
}

focusedVisualTest().catch(console.error);
