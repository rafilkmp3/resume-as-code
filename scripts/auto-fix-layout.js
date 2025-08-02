const fs = require('fs');
const path = require('path');

function autoFixLayoutIssues() {
  const templatePath = './template.html';
  
  if (!fs.existsSync(templatePath)) {
    console.error('template.html not found');
    return;
  }
  
  let template = fs.readFileSync(templatePath, 'utf8');
  let changesMade = false;
  
  console.log('🔧 Analyzing template.html for layout issues...');
  
  // Fix 1: Ensure proper mobile container styles
  if (true) { // Force apply fixes
    console.log('📱 Adding mobile container fixes...');
    const mobileCSS = `
        /* Mobile container fixes */
        @media (max-width: 768px) {
            html, body {
                width: 100% !important;
                overflow-x: hidden !important;
            }
            
            .container, .main-content, .content, .page {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 0.75rem !important;
                box-sizing: border-box !important;
            }
            
            .header {
                padding: 1rem 0.75rem !important;
            }
            
            /* Fix any div that might cause overflow */
            div, section, article, main {
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
        }`;
    
    template = template.replace('</style>', mobileCSS + '\n</style>');
    changesMade = true;
  }
  
  // Fix 2: Ensure minimum touch target sizes
  if (true) { // Force apply fixes
    console.log('👆 Adding touch target optimizations...');
    const touchCSS = `
        /* Touch target optimizations */
        @media (max-width: 768px) {
            a, button, .contact-link, .skill-tag, .social-link, [role="button"], [tabindex="0"] {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px 16px !important;
                margin: 4px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                touch-action: manipulation !important;
            }
            
            .skill-tag {
                font-size: 16px !important;
                line-height: 1.2 !important;
                padding: 8px 12px !important;
            }
        }`;
    
    template = template.replace('</style>', touchCSS + '\n</style>');
    changesMade = true;
  }
  
  // Fix 3: Ensure proper mobile text sizes
  if (true) { // Force apply fixes
    console.log('📝 Fixing mobile text sizes...');
    const textCSS = `
        /* Mobile text size fixes */
        @media (max-width: 768px) {
            * {
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            
            h1 {
                font-size: 28px !important;
                line-height: 1.3 !important;
            }
            
            h2 {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            
            h3 {
                font-size: 20px !important;
                line-height: 1.3 !important;
            }
            
            h4, h5, h6 {
                font-size: 18px !important;
                line-height: 1.3 !important;
            }
            
            .skill-tag {
                font-size: 16px !important;
                line-height: 1.2 !important;
            }
            
            small, .small {
                font-size: 16px !important;
            }
        }`;
    
    template = template.replace('</style>', textCSS + '\n</style>');
    changesMade = true;
  }
  
  // Fix 4: Ensure proper mobile breakpoints
  if (template.includes('@media (max-width: 480px)')) {
    console.log('📏 Updating mobile breakpoints...');
    template = template.replace(/@media \(max-width: 480px\)/g, '@media (max-width: 430px)');
    changesMade = true;
  }
  
  // Fix 5: Remove problematic margin/padding on mobile
  if (template.includes('margin: 0.5rem') && template.includes('@media')) {
    console.log('🔧 Removing problematic mobile margins...');
    template = template.replace(/margin: 0\.5rem;/g, 'margin: 0;');
    changesMade = true;
  }
  
  // Fix 6: Add viewport meta tag if missing
  if (!template.includes('viewport')) {
    console.log('📱 Adding viewport meta tag...');
    template = template.replace('<head>', '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    changesMade = true;
  }
  
  // Write changes back to file
  if (changesMade) {
    fs.writeFileSync(templatePath, template);
    console.log('✅ Auto-fixes applied to template.html');
    console.log('📋 Changes made:');
    console.log('   - Mobile container optimizations');
    console.log('   - Touch target size compliance');
    console.log('   - Mobile text size improvements');
    console.log('   - Updated mobile breakpoints');
    console.log('   - Removed problematic margins');
    console.log('   - Added viewport meta tag');
  } else {
    console.log('✅ No fixes needed - template.html is already optimized');
  }
}

// Run if called directly
if (require.main === module) {
  autoFixLayoutIssues();
}

module.exports = { autoFixLayoutIssues };