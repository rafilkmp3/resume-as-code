const { test } = require('@playwright/test');
const path = require('path');

test('Local build JavaScript execution test', async ({ page }) => {
    // Listen for errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });
    
    // Load the local build
    const localFile = 'file://' + path.resolve(__dirname, 'dist', 'index.html');
    await page.goto(localFile);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Local build errors:', pageErrors);
    
    // Test if functions are available
    const jsWorking = await page.evaluate(() => {
        return {
            windowKeys: Object.keys(window).filter(k => k.startsWith('initialize')),
            experienceFunction: typeof window.initializeExperiencePagination,
            projectFunction: typeof window.initializeProjectsPagination,
            educationFunction: typeof window.initializeEducationPagination,
            skillsFunction: typeof window.initializeSkillsPagination
        };
    });
    
    console.log('Local build function test:', jsWorking);
});