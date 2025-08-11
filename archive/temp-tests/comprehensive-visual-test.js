const puppeteer = require('puppeteer');

async function comprehensiveVisualTest() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    defaultViewport: null
  });
  const page = await browser.newPage();
  
  console.log('🔍 Starting comprehensive visual testing and analysis...');
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Test multiple viewport sizes
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];
  
  const themes = ['light', 'dark'];
  
  for (const viewport of viewports) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    await page.setViewport({ width: viewport.width, height: viewport.height });
    
    for (const theme of themes) {
      console.log(`  🎨 ${theme} theme:`);
      
      // Set theme
      await page.evaluate((theme) => {
        document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
        document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
      }, theme);
      
      await page.waitForTimeout(1000);
      
      // 1. Full page screenshot
      await page.screenshot({ 
        path: `./visual-evidence/full-${viewport.name}-${theme}.png`,
        fullPage: true
      });
      console.log(`    ✅ Full page screenshot`);
      
      // 2. Header section (with location badge)
      const headerSection = await page.$('.header');
      if (headerSection) {
        await headerSection.screenshot({ 
          path: `./visual-evidence/header-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Header section with location badge`);
      }
      
      // 3. Theme toggle button close-up
      const themeToggle = await page.$('.theme-toggle');
      if (themeToggle) {
        await themeToggle.screenshot({ 
          path: `./visual-evidence/theme-toggle-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Theme toggle close-up`);
      }
      
      // 4. Contact section  
      const contactSection = await page.$('#contact');
      if (contactSection) {
        await contactSection.screenshot({ 
          path: `./visual-evidence/contact-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Contact section`);
      }
      
      // 5. Experience section (checking underline)
      const experienceSection = await page.$('#experience-section');
      if (experienceSection) {
        // Hover to trigger underline animation
        await experienceSection.hover();
        await page.waitForTimeout(500);
        
        await experienceSection.screenshot({ 
          path: `./visual-evidence/experience-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Experience section with underline`);
      }
      
      // 6. Education section (for underline comparison)
      const educationSection = await page.$('h2:has-text("Education")').then(h2 => 
        h2 ? h2.closest('.section') : null
      );
      if (educationSection) {
        await educationSection.hover();
        await page.waitForTimeout(500);
        
        await educationSection.screenshot({ 
          path: `./visual-evidence/education-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Education section with underline`);
      }
      
      // 7. Social links area (checking for blue boxes)
      const socialLinks = await page.$('.social-links, .footer-social');
      if (socialLinks) {
        await socialLinks.screenshot({ 
          path: `./visual-evidence/social-${viewport.name}-${theme}.png`
        });
        console.log(`    ✅ Social links area`);
      }
    }
  }
  
  // Detailed analysis tests
  console.log('\n🔬 Running detailed analysis tests...');
  
  await page.setViewport({ width: 1280, height: 720 });
  
  // Test theme toggle functionality
  console.log('\n🎨 Testing theme toggle functionality:');
  const themeToggleTest = await page.evaluate(() => {
    const toggle = document.getElementById('darkToggle');
    if (!toggle) return { error: 'Theme toggle not found' };
    
    // Check initial state
    const initialTheme = document.body.getAttribute('data-theme') || 'light';
    
    // Click toggle
    toggle.click();
    
    // Check new state after click
    const newTheme = document.body.getAttribute('data-theme') || 'light';
    
    return {
      initialTheme,
      newTheme,
      toggleWorks: initialTheme !== newTheme,
      hasTextContent: toggle.textContent.trim(),
      svgCount: toggle.querySelectorAll('svg').length,
      buttonSize: {
        width: toggle.offsetWidth,
        height: toggle.offsetHeight
      }
    };
  });
  
  console.log('Theme toggle analysis:', themeToggleTest);
  
  // Test Calendly link
  console.log('\n📅 Testing Calendly link:');
  const calendlyTest = await page.evaluate(() => {
    const calendlyLink = document.querySelector('a[href*="calendly"]');
    if (!calendlyLink) return { error: 'Calendly link not found' };
    
    return {
      text: calendlyLink.textContent.trim(),
      href: calendlyLink.href,
      visible: calendlyLink.offsetWidth > 0 && calendlyLink.offsetHeight > 0,
      parentText: calendlyLink.parentElement.textContent.trim()
    };
  });
  
  console.log('Calendly link analysis:', calendlyTest);
  
  // Test section underlines consistency
  console.log('\n📏 Testing section underline consistency:');
  const underlineTest = await page.evaluate(() => {
    const sections = document.querySelectorAll('.section');
    const results = [];
    
    sections.forEach((section, index) => {
      const h2 = section.querySelector('h2');
      if (h2) {
        // Simulate hover
        section.dispatchEvent(new MouseEvent('mouseenter'));
        
        // Get computed styles for the ::after pseudo-element
        const afterStyles = window.getComputedStyle(h2, '::after');
        
        results.push({
          sectionTitle: h2.textContent.trim(),
          index: index,
          afterWidth: afterStyles.width,
          afterHeight: afterStyles.height,
          afterBackground: afterStyles.background,
          h2Width: h2.offsetWidth
        });
      }
    });
    
    return results;
  });
  
  console.log('Section underline analysis:');
  underlineTest.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.sectionTitle}:`);
    console.log(`     - Underline width: ${result.afterWidth}`);
    console.log(`     - H2 width: ${result.h2Width}px`);
    console.log(`     - Background: ${result.afterBackground.substring(0, 50)}...`);
  });
  
  // Test contact section colors in both themes
  console.log('\n📞 Testing contact section color consistency:');
  const contactColorTest = await page.evaluate(() => {
    const results = {};
    const themes = ['light', 'dark'];
    
    themes.forEach(theme => {
      document.body.setAttribute('data-theme', theme === 'light' ? '' : theme);
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const labels = contactSection.querySelectorAll('.contact-label');
        const links = contactSection.querySelectorAll('.contact-link');
        const icons = contactSection.querySelectorAll('.contact-icon');
        
        results[theme] = {
          labelColors: Array.from(labels).map(label => ({
            text: label.textContent.trim(),
            color: window.getComputedStyle(label).color,
            visible: label.offsetWidth > 0 && label.offsetHeight > 0
          })),
          linkColors: Array.from(links).map(link => ({
            text: link.textContent.trim(),
            color: window.getComputedStyle(link).color,
            visible: link.offsetWidth > 0 && link.offsetHeight > 0
          })),
          iconColors: Array.from(icons).map(icon => ({
            color: window.getComputedStyle(icon).color,
            visible: icon.offsetWidth > 0 && icon.offsetHeight > 0
          }))
        };
      }
    });
    
    return results;
  });
  
  console.log('Contact section color analysis:');
  Object.keys(contactColorTest).forEach(theme => {
    console.log(`  ${theme} theme:`);
    const data = contactColorTest[theme];
    if (data.labelColors) {
      console.log(`    Labels: ${data.labelColors.map(l => `"${l.text}": ${l.color}`).join(', ')}`);
      console.log(`    Links: ${data.linkColors.map(l => `"${l.text}": ${l.color}`).join(', ')}`);
      console.log(`    Icons: ${data.iconColors.length} icons with colors`);
    }
  });
  
  await browser.close();
  console.log('\n✅ Comprehensive visual testing completed!');
  console.log('\n📸 Generated screenshots for analysis:');
  console.log('  - Full page: All viewports × both themes');
  console.log('  - Header sections: All viewports × both themes'); 
  console.log('  - Theme toggles: All viewports × both themes');
  console.log('  - Contact sections: All viewports × both themes');
  console.log('  - Experience sections: All viewports × both themes');
  console.log('  - Education sections: All viewports × both themes');
  console.log('  - Social links: All viewports × both themes');
  console.log('\n🔍 Ready for detailed image analysis!');
}

comprehensiveVisualTest().catch(console.error);
