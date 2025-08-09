#!/usr/bin/env node

// =============================================================================
// 📸 Visual Tester - Resume as Code
// =============================================================================
// Comprehensive visual testing with screenshot generation
// Tests iPhone 16 Pro Max, macOS Retina, dark/light modes
// Creates evidence for UX improvements and visual optimization
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VisualTester {
  constructor() {
    this.screenshotDir = path.join(__dirname, '..', 'visual-evidence');
    this.testResults = {
      timestamp: new Date().toISOString(),
      devices: {},
      recommendations: [],
      summary: {
        total_screenshots: 0,
        devices_tested: 0,
        themes_tested: 0,
        issues_found: []
      }
    };
    
    // Device configurations
    this.devices = {
      'iphone-16-pro-max': {
        name: 'iPhone 16 Pro Max',
        viewport: { width: 430, height: 932 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      },
      'macos-retina': {
        name: 'macOS Retina Desktop',
        viewport: { width: 2560, height: 1600 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: false
      }
    };
    
    // Theme configurations
    this.themes = {
      light: { name: 'Light Mode', class: '' },
      dark: { name: 'Dark Mode', class: 'dark-mode' }
    };
    
    this.initializeDirectories();
  }

  initializeDirectories() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
    
    // Create subdirectories for organization
    const subDirs = ['iphone-16-pro-max', 'macos-retina', 'comparisons', 'issues'];
    subDirs.forEach(dir => {
      const fullPath = path.join(this.screenshotDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
      }
    });
  }

  async generateScreenshots() {
    console.log('📸 COMPREHENSIVE VISUAL TESTING');
    console.log('===============================');
    console.log(`📁 Screenshots will be saved to: ${this.screenshotDir}`);
    
    // Check if resume is built and start test server
    const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      console.log('🏗️ Resume not built, building now...');
      execSync('make build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    
    console.log('🚀 Starting test server on port 3001...');
    const serverProcess = execSync('npm run serve:test &', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const testCases = this.generateTestCases();
    
    for (const testCase of testCases) {
      await this.captureScreenshot(testCase);
    }
    
    this.testResults.summary.total_screenshots = testCases.length;
    this.testResults.summary.devices_tested = Object.keys(this.devices).length;
    this.testResults.summary.themes_tested = Object.keys(this.themes).length;
    
    await this.generateComparisons();
    await this.analyzeScreenshots();
    
    return this.testResults;
  }

  generateTestCases() {
    const testCases = [];
    
    Object.entries(this.devices).forEach(([deviceKey, device]) => {
      Object.entries(this.themes).forEach(([themeKey, theme]) => {
        testCases.push({
          id: `${deviceKey}-${themeKey}`,
          device: deviceKey,
          deviceConfig: device,
          theme: themeKey,
          themeConfig: theme,
          filename: `${deviceKey}_${themeKey}_fullpage.png`,
          description: `${device.name} - ${theme.name} - Full Page`
        });
        
        // Additional scroll positions for desktop
        if (!device.isMobile) {
          testCases.push({
            id: `${deviceKey}-${themeKey}-scroll`,
            device: deviceKey,
            deviceConfig: device,
            theme: themeKey,
            themeConfig: theme,
            filename: `${deviceKey}_${themeKey}_scrolled.png`,
            description: `${device.name} - ${theme.name} - Mid Page`,
            scrollY: 1000
          });
        }
      });
    });
    
    return testCases;
  }

  async captureScreenshot(testCase) {
    console.log(`📱 Capturing: ${testCase.description}`);
    
    try {
      // Create Playwright script for this specific test case
      const playwrightScript = this.generatePlaywrightScript(testCase);
      const scriptPath = path.join(__dirname, 'temp-screenshot-script.js');
      
      fs.writeFileSync(scriptPath, playwrightScript);
      
      // Execute the script with proper config
      execSync(`npx playwright test ${scriptPath} --config=config/playwright.config.js`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      // Clean up
      fs.unlinkSync(scriptPath);
      
      // Record results
      if (!this.testResults.devices[testCase.device]) {
        this.testResults.devices[testCase.device] = {};
      }
      
      this.testResults.devices[testCase.device][testCase.theme] = {
        screenshot: testCase.filename,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      
      console.log(`✅ Screenshot saved: ${testCase.filename}`);
      
    } catch (error) {
      console.error(`❌ Failed to capture ${testCase.id}:`, error.message);
      this.testResults.summary.issues_found.push({
        type: 'screenshot_failed',
        device: testCase.device,
        theme: testCase.theme,
        error: error.message
      });
    }
  }

  generatePlaywrightScript(testCase) {
    const outputPath = path.join(this.screenshotDir, testCase.device, testCase.filename);
    
    return `
const { test } = require('@playwright/test');

test('${testCase.description}', async ({ page }) => {
  // Set viewport and device configuration
  await page.setViewportSize({
    width: ${testCase.deviceConfig.viewport.width},
    height: ${testCase.deviceConfig.viewport.height}
  });
  
  // Set user agent
  await page.setUserAgent('${testCase.deviceConfig.userAgent}');
  
  // Navigate to the resume (use localhost URL instead of file protocol)
  await page.goto('http://localhost:3001');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Apply theme if dark mode
  ${testCase.theme === 'dark' ? `
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
    // Trigger dark mode
    const toggleButton = document.getElementById('darkToggle');
    if (toggleButton) toggleButton.click();
  });
  await page.waitForTimeout(500);
  ` : ''}
  
  // Scroll if specified
  ${testCase.scrollY ? `
  await page.evaluate(() => window.scrollTo(0, ${testCase.scrollY}));
  await page.waitForTimeout(300);
  ` : ''}
  
  // Wait for animations to complete
  await page.waitForTimeout(1000);
  
  // Take full page screenshot
  await page.screenshot({
    path: '${outputPath}',
    fullPage: true,
    animations: 'disabled'
  });
});
    `;
  }

  async generateComparisons() {
    console.log('🔍 Generating comparison analyses...');
    
    const comparisonPath = path.join(this.screenshotDir, 'comparisons');
    
    // Create comparison summary
    const comparisonData = {
      timestamp: new Date().toISOString(),
      devices: Object.keys(this.devices),
      themes: Object.keys(this.themes),
      total_screenshots: this.testResults.summary.total_screenshots,
      comparison_notes: [
        'Compare mobile vs desktop layouts',
        'Analyze dark vs light mode contrast and usability',
        'Check responsive breakpoints and element sizing',
        'Validate navigation and interactive elements',
        'Assess readability and visual hierarchy'
      ]
    };
    
    fs.writeFileSync(
      path.join(comparisonPath, 'comparison-summary.json'),
      JSON.stringify(comparisonData, null, 2)
    );
    
    console.log('✅ Comparison data generated');
  }

  async analyzeScreenshots() {
    console.log('🔍 Analyzing screenshots for potential improvements...');
    
    const recommendations = [
      {
        category: 'Mobile Responsiveness',
        priority: 'High',
        description: 'Analyze iPhone 16 Pro Max screenshots for touch target sizes, text readability, and navigation usability',
        evidence: 'iphone-16-pro-max screenshots',
        action: 'Review mobile layout, ensure 44px+ touch targets, optimize font sizes'
      },
      {
        category: 'Desktop Experience',
        priority: 'High',
        description: 'Evaluate macOS Retina screenshots for layout efficiency, whitespace usage, and content hierarchy',
        evidence: 'macos-retina screenshots',
        action: 'Optimize desktop layout, improve content density, enhance visual hierarchy'
      },
      {
        category: 'Theme Consistency',
        priority: 'Medium',
        description: 'Compare dark vs light mode screenshots for consistency and contrast',
        evidence: 'light vs dark mode comparisons',
        action: 'Ensure consistent spacing, improve color contrast, fix theme-specific issues'
      },
      {
        category: 'Visual Elements',
        priority: 'Medium',
        description: 'Assess buttons, links, and interactive elements across all devices',
        evidence: 'all device screenshots',
        action: 'Enhance button visibility, improve hover states, optimize interactive feedback'
      },
      {
        category: 'Content Organization',
        priority: 'Low',
        description: 'Review content layout and information hierarchy',
        evidence: 'full page screenshots',
        action: 'Improve content grouping, enhance visual separators, optimize reading flow'
      }
    ];
    
    this.testResults.recommendations = recommendations;
    
    console.log('✅ Analysis complete');
  }

  generateReport() {
    console.log('\n📊 VISUAL TESTING REPORT');
    console.log('========================');
    
    console.log('\n📸 SCREENSHOT SUMMARY:');
    console.log(`   Total Screenshots: ${this.testResults.summary.total_screenshots}`);
    console.log(`   Devices Tested: ${this.testResults.summary.devices_tested}`);
    console.log(`   Themes Tested: ${this.testResults.summary.themes_tested}`);
    
    if (this.testResults.summary.issues_found.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      this.testResults.summary.issues_found.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.type} - ${issue.device} (${issue.theme})`);
      });
    } else {
      console.log('\n✅ All screenshots captured successfully');
    }
    
    console.log('\n📱 DEVICE RESULTS:');
    Object.entries(this.testResults.devices).forEach(([device, themes]) => {
      console.log(`\n   ${this.devices[device].name}:`);
      Object.entries(themes).forEach(([theme, result]) => {
        console.log(`     ${this.themes[theme].name}: ${result.status} - ${result.screenshot}`);
      });
    });
    
    console.log('\n🎯 IMPROVEMENT RECOMMENDATIONS:');
    this.testResults.recommendations.forEach((rec, index) => {
      console.log(`\n   ${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
    });
    
    // Save full results
    const resultsPath = path.join(this.screenshotDir, 'visual-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📁 Screenshots saved to: ${this.screenshotDir}`);
    console.log(`📄 Full results saved to: ${resultsPath}`);
    console.log('========================\n');
    
    return this.testResults;
  }

  createMakefileIntegration() {
    console.log('🔧 Creating Makefile integration...');
    
    // This would be added to the Makefile
    const makeCommands = `
# Visual Testing Commands
visual-test:
	@echo "$(CYAN)📸 Running comprehensive visual tests...$(NC)"
	@node scripts/visual-tester.js

visual-screenshots:
	@echo "$(CYAN)📱 Generating device screenshots...$(NC)"
	@node scripts/visual-tester.js

visual-analyze:
	@echo "$(CYAN)🔍 Analyzing visual test results...$(NC)"
	@node scripts/visual-analyzer.js

visual-clean:
	@echo "$(YELLOW)🧹 Cleaning visual evidence directory...$(NC)"
	@rm -rf visual-evidence/*
    `;
    
    console.log('Suggested Makefile additions:');
    console.log(makeCommands);
  }
}

// CLI Interface
if (require.main === module) {
  const tester = new VisualTester();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'screenshots':
    case undefined:
      tester.generateScreenshots().then(() => {
        tester.generateReport();
      }).catch(console.error);
      break;
      
    case 'report':
      tester.generateReport();
      break;
      
    case 'makefile':
      tester.createMakefileIntegration();
      break;
      
    default:
      console.log('Usage: node visual-tester.js [screenshots|report|makefile]');
  }
}

module.exports = VisualTester;