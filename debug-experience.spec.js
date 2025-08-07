const { test } = require('@playwright/test');

test('Debug Experience Load More visibility', async ({ page }) => {
    await page.goto('https://rafilkmp3.github.io/resume-as-code/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check Experience section detailed state
    const experienceDebug = await page.evaluate(() => {
        const workItems = document.querySelectorAll('.work-item:not(.project-item)');
        const loadMoreContainer = document.getElementById('load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        // Get computed styles and actual state
        const containerStyles = loadMoreContainer ? window.getComputedStyle(loadMoreContainer) : null;
        
        return {
            totalWorkItems: workItems.length,
            visibleWorkItems: Array.from(workItems).filter(item => 
                window.getComputedStyle(item).display !== 'none'
            ).length,
            hiddenWorkItems: Array.from(workItems).filter(item => 
                window.getComputedStyle(item).display === 'none'
            ).length,
            loadMoreContainer: {
                exists: !!loadMoreContainer,
                display: containerStyles?.display,
                visibility: containerStyles?.visibility,
                opacity: containerStyles?.opacity,
                hasHiddenClass: loadMoreContainer?.classList.contains('hidden'),
                innerHTML: loadMoreContainer?.innerHTML?.substring(0, 100) + '...'
            },
            loadMoreBtn: {
                exists: !!loadMoreBtn,
                textContent: loadMoreBtn?.textContent
            },
            functionCalled: typeof window.initializeExperiencePagination === 'function'
        };
    });
    
    console.log('Experience Debug Info:', JSON.stringify(experienceDebug, null, 2));
});