const { test } = require('@playwright/test');

test('Simple JavaScript execution test', async ({ page }) => {
    // Listen for console errors
    const consoleMessages = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(msg.text());
        }
    });
    
    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });
    
    await page.goto('https://rafilkmp3.github.io/resume-as-code/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Console errors:', consoleMessages);
    console.log('Page errors:', pageErrors);
    
    // Test if ANY JavaScript is working at all
    const jsWorking = await page.evaluate(() => {
        return {
            basicJs: typeof console !== 'undefined',
            domReady: document.readyState === 'complete',
            hasScript: !!document.querySelector('script'),
            windowKeys: Object.keys(window).filter(k => k.startsWith('initialize')),
            consoleErrors: window.jsErrors || 'no error tracking'
        };
    });
    
    console.log('JavaScript test results:', jsWorking);
    
    // Check for specific elements that should exist
    const elementTests = await page.evaluate(() => {
        return {
            experienceItems: document.querySelectorAll('.work-item:not(.project-item)').length,
            projectItems: document.querySelectorAll('.project-item').length,
            skillItems: document.querySelectorAll('.skill-category-item').length,
            loadMoreContainer: !!document.getElementById('load-more-container'),
            loadMoreContainerVisible: window.getComputedStyle(document.getElementById('load-more-container')).display !== 'none'
        };
    });
    
    console.log('Element test results:', elementTests);
});