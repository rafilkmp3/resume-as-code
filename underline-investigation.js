const puppeteer = require('puppeteer');

async function investigateUnderlines() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('🔍 Investigating section underlines in detail...');
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 720 });
  
  // Get all sections and test underlines
  const underlineResults = await page.evaluate(() => {
    const sections = document.querySelectorAll('.section');
    const results = [];
    
    sections.forEach((section, index) => {
      const h2 = section.querySelector('h2');
      if (h2) {
        // Check initial state
        const initialAfter = window.getComputedStyle(h2, '::after');
        
        // Trigger hover
        section.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        
        // Wait a bit and check hovered state
        setTimeout(() => {
          const hoveredAfter = window.getComputedStyle(h2, '::after');
          
          results.push({
            sectionTitle: h2.textContent.trim(),
            sectionIndex: index,
            h2Width: h2.offsetWidth,
            initial: {
              width: initialAfter.width,
              opacity: initialAfter.opacity,
              display: initialAfter.display
            },
            hovered: {
              width: hoveredAfter.width,
              opacity: hoveredAfter.opacity,
              display: hoveredAfter.display
            },
            hasUnderline: initialAfter.display !== 'none' && initialAfter.height !== '0px'
          });
        }, 100);
      }
    });
    
    return new Promise(resolve => {
      setTimeout(() => resolve(results), 200);
    });
  });
  
  console.log('\n📏 Underline Investigation Results:');
  underlineResults.forEach((result, i) => {
    console.log(`\n${i + 1}. ${result.sectionTitle}:`);
    console.log(`   H2 Width: ${result.h2Width}px`);
    console.log(`   Initial width: ${result.initial.width}`);
    console.log(`   Hovered width: ${result.hovered.width}`);
    console.log(`   Has underline: ${result.hasUnderline}`);
    
    // Check if underline works properly
    const worksCorrectly = result.hovered.width !== '0px' && 
                          result.hovered.width !== result.initial.width;
    console.log(`   ✅ Working: ${worksCorrectly ? 'YES' : 'NO'}`);
  });
  
  // Take screenshots during hover states
  console.log('\n📸 Capturing hover states...');
  
  const sections = await page.$$('.section');
  for (let i = 0; i < Math.min(sections.length, 5); i++) {
    const section = sections[i];
    const h2 = await section.$('h2');
    
    if (h2) {
      const sectionName = await h2.evaluate(el => 
        el.textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      );
      
      // Move away first to reset state
      await page.mouse.move(100, 100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Take before hover screenshot
      await section.screenshot({ 
        path: `./visual-evidence/underline-before-${sectionName}.png`
      });
      
      // Hover and wait for animation
      await section.hover();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for full animation
      
      // Take after hover screenshot  
      await section.screenshot({ 
        path: `./visual-evidence/underline-after-${sectionName}.png`
      });
      
      console.log(`  ✅ Captured hover states for ${sectionName}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ Underline investigation completed!');
}

investigateUnderlines().catch(console.error);
