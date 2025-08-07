const { test } = require('@playwright/test');
const path = require('path');

test('Local build Load More visibility test', async ({ page }) => {
    // Load the local build
    const localFile = 'file://' + path.resolve(__dirname, 'dist', 'index.html');
    await page.goto(localFile);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Test Experience Load More
    const experienceDebug = await page.evaluate(() => {
        const workItems = document.querySelectorAll('.work-item:not(.project-item)');
        const loadMoreContainer = document.getElementById('load-more-container');
        const containerStyles = loadMoreContainer ? window.getComputedStyle(loadMoreContainer) : null;
        
        return {
            totalWorkItems: workItems.length,
            visibleWorkItems: Array.from(workItems).filter(item => 
                window.getComputedStyle(item).display !== 'none'
            ).length,
            loadMoreContainer: {
                exists: !!loadMoreContainer,
                display: containerStyles?.display,
                isVisible: containerStyles?.display !== 'none'
            }
        };
    });
    
    console.log('Local Experience Debug:', JSON.stringify(experienceDebug, null, 2));
    
    // Test Projects Load More
    const projectsDebug = await page.evaluate(() => {
        const projectItems = document.querySelectorAll('.project-item');
        const loadMoreContainer = document.getElementById('load-more-projects-container');
        const containerStyles = loadMoreContainer ? window.getComputedStyle(loadMoreContainer) : null;
        
        return {
            totalProjects: projectItems.length,
            visibleProjects: Array.from(projectItems).filter(item => 
                window.getComputedStyle(item).display !== 'none'
            ).length,
            loadMoreContainer: {
                exists: !!loadMoreContainer,
                display: containerStyles?.display,
                isVisible: containerStyles?.display !== 'none'
            }
        };
    });
    
    console.log('Local Projects Debug:', JSON.stringify(projectsDebug, null, 2));
});