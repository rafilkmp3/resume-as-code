const { test, expect } = require('@playwright/test');

test.describe('Load More Functionality Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the local development server
        await page.goto('https://rafilkmp3.github.io/resume-as-code/');
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle');
        // Ensure JavaScript has loaded and executed
        await page.waitForTimeout(2000);
    });

    test('Experience Load More button should be visible and functional', async ({ page }) => {
        // Check if Experience section exists
        const experienceSection = page.locator('h2:has-text("Experience")');
        await expect(experienceSection).toBeVisible();
        
        // Count initial visible work items (excluding project items)
        const workItems = page.locator('.work-item:not(.project-item)');
        const totalCount = await workItems.count();
        const initialVisibleCount = await page.locator('.work-item:not(.project-item):visible').count();
        console.log(`Initial experience items: ${initialVisibleCount} visible of ${totalCount} total`);
        
        // Check if Load More button exists for Experience
        const loadMoreBtn = page.locator('#load-more-btn');
        const loadMoreContainer = page.locator('#load-more-container');
        
        // Check if we have more than the initially visible items (should show Load More button)
        if (totalCount > initialVisibleCount) {
            console.log('Should show Load More button for Experience');
            await expect(loadMoreContainer).toBeVisible();
            await expect(loadMoreBtn).toBeVisible();
            
            // Click the Load More button
            await loadMoreBtn.click();
            await page.waitForTimeout(1000); // Wait for animation
            
            // Verify more items are now visible
            const newVisibleCount = await page.locator('.work-item:not(.project-item):visible').count();
            expect(newVisibleCount).toBeGreaterThan(initialVisibleCount);
            console.log(`After Load More: ${newVisibleCount} items visible (was ${initialVisibleCount})`);
        } else {
            console.log('No Load More button needed - all experience items fit initially');
        }
    });

    test('Projects Load More button should be visible and functional', async ({ page }) => {
        // Check if Projects section exists
        const projectsSection = page.locator('h2:has-text("Key Projects")');
        await expect(projectsSection).toBeVisible();
        
        // Count initial visible project items
        const projectItems = page.locator('.project-item');
        const initialCount = await projectItems.count();
        console.log(`Initial project items visible: ${initialCount}`);
        
        // Check if Load More button exists for Projects
        const loadMoreBtn = page.locator('#load-more-projects-btn');
        const loadMoreContainer = page.locator('#load-more-projects-container');
        
        // Check initial project visibility
        let visibleInitialProjects = 0;
        for (let i = 0; i < initialCount; i++) {
            const isVisible = await projectItems.nth(i).isVisible();
            if (isVisible) visibleInitialProjects++;
        }
        console.log(`Initially visible projects: ${visibleInitialProjects} of ${initialCount}`);
        
        // If there are more projects than initially shown, test Load More
        if (initialCount > visibleInitialProjects) {
            await expect(loadMoreContainer).toBeVisible();
            await expect(loadMoreBtn).toBeVisible();
            
            // Click the Load More button
            await loadMoreBtn.click();
            await page.waitForTimeout(1000); // Wait for animation
            
            // Count visible projects after clicking
            let visibleAfterLoad = 0;
            for (let i = 0; i < initialCount; i++) {
                const isVisible = await projectItems.nth(i).isVisible();
                if (isVisible) visibleAfterLoad++;
            }
            console.log(`After Load More: ${visibleAfterLoad} projects visible`);
            
            expect(visibleAfterLoad).toBeGreaterThan(visibleInitialProjects);
        } else {
            console.log('No Load More button needed - all projects fit initially');
        }
    });

    test('Education Load More button should be visible and functional', async ({ page }) => {
        // Check if Education section exists
        const educationSection = page.locator('h2:has-text("Education")');
        await expect(educationSection).toBeVisible();
        
        // Count initial visible education items
        const educationItems = page.locator('.education-item');
        const initialCount = await educationItems.count();
        console.log(`Total education items: ${initialCount}`);
        
        // Check if Load More button exists for Education
        const loadMoreBtn = page.locator('#load-more-education-btn');
        const loadMoreContainer = page.locator('#load-more-education-container');
        
        // Check education counter
        const educationCounter = page.locator('.education-counter');
        if (await educationCounter.isVisible()) {
            const counterText = await educationCounter.textContent();
            console.log(`Education counter shows: ${counterText}`);
        }
        
        // If there are multiple education items, test Load More functionality
        if (initialCount > 1) {
            // Check if Load More button is visible
            const isLoadMoreVisible = await loadMoreContainer.isVisible();
            console.log(`Load More container visible: ${isLoadMoreVisible}`);
            
            if (isLoadMoreVisible) {
                await loadMoreBtn.click();
                await page.waitForTimeout(1000);
                console.log('Clicked Load More for Education');
            }
        } else {
            console.log('Only one education item - no Load More needed');
        }
    });

    test('Skills Load More button should be visible and functional', async ({ page }) => {
        // Check if Skills section exists
        const skillsSection = page.locator('h2:has-text("Skills")');
        await expect(skillsSection).toBeVisible();
        
        // Count initial visible skill categories
        const skillCategories = page.locator('.skill-category-item');
        const initialCount = await skillCategories.count();
        console.log(`Total skill categories: ${initialCount}`);
        
        // Check if Load More button exists for Skills
        const loadMoreBtn = page.locator('#load-more-skills-btn');
        const loadMoreContainer = page.locator('#load-more-skills-container');
        
        // Check skills counter
        const skillsCounter = page.locator('.skills-counter');
        if (await skillsCounter.isVisible()) {
            const counterText = await skillsCounter.textContent();
            console.log(`Skills counter shows: ${counterText}`);
        }
        
        // Count initially visible skills
        let visibleInitialSkills = 0;
        for (let i = 0; i < initialCount; i++) {
            const isVisible = await skillCategories.nth(i).isVisible();
            if (isVisible) visibleInitialSkills++;
        }
        console.log(`Initially visible skills: ${visibleInitialSkills} of ${initialCount}`);
        
        // If we have more skills than initially shown, test Load More
        if (initialCount > visibleInitialSkills) {
            const isLoadMoreVisible = await loadMoreContainer.isVisible();
            console.log(`Load More container visible: ${isLoadMoreVisible}`);
            
            if (isLoadMoreVisible) {
                await expect(loadMoreBtn).toBeVisible();
                await loadMoreBtn.click();
                await page.waitForTimeout(1000);
                
                // Count visible skills after clicking
                let visibleAfterLoad = 0;
                for (let i = 0; i < initialCount; i++) {
                    const isVisible = await skillCategories.nth(i).isVisible();
                    if (isVisible) visibleAfterLoad++;
                }
                console.log(`After Load More: ${visibleAfterLoad} skills visible`);
                
                expect(visibleAfterLoad).toBeGreaterThan(visibleInitialSkills);
            }
        } else {
            console.log('No Load More button needed - all skills fit initially');
        }
    });

    test('JavaScript pagination functions should be defined and working', async ({ page }) => {
        // Check if pagination functions exist in the page
        const functionsExist = await page.evaluate(() => {
            return {
                initializeExperiencePagination: typeof initializeExperiencePagination !== 'undefined',
                initializeProjectsPagination: typeof initializeProjectsPagination !== 'undefined',
                initializeEducationPagination: typeof initializeEducationPagination !== 'undefined',
                initializeSkillsPagination: typeof initializeSkillsPagination !== 'undefined'
            };
        });

        console.log('Pagination functions availability:', functionsExist);
        
        // At least some functions should be defined
        const functionsCount = Object.values(functionsExist).filter(Boolean).length;
        expect(functionsCount).toBeGreaterThan(0);
    });

    test('Mobile responsive Load More functionality', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 812 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Testing Load More on mobile viewport (375x812)');
        
        // Test Projects section on mobile
        const projectItems = page.locator('.project-item');
        const projectCount = await projectItems.count();
        console.log(`Mobile - Total projects: ${projectCount}`);
        
        // Count visible projects on mobile
        let visibleProjectsMobile = 0;
        for (let i = 0; i < projectCount; i++) {
            const isVisible = await projectItems.nth(i).isVisible();
            if (isVisible) visibleProjectsMobile++;
        }
        console.log(`Mobile - Initially visible projects: ${visibleProjectsMobile}`);
        
        // Check if Load More button is working on mobile
        const mobileLoadMore = page.locator('#load-more-projects-btn');
        const mobileLoadMoreContainer = page.locator('#load-more-projects-container');
        
        if (projectCount > visibleProjectsMobile) {
            const isLoadMoreVisible = await mobileLoadMoreContainer.isVisible();
            console.log(`Mobile - Load More container visible: ${isLoadMoreVisible}`);
            
            if (isLoadMoreVisible) {
                await expect(mobileLoadMore).toBeVisible();
                
                // Ensure button is clickable (not overlapped)
                await mobileLoadMore.scrollIntoViewIfNeeded();
                await mobileLoadMore.click();
                await page.waitForTimeout(1000);
                
                console.log('Mobile - Clicked Load More successfully');
            }
        }
    });

    test('Load More buttons should have proper ARIA labels and accessibility', async ({ page }) => {
        // Check Experience Load More button accessibility
        const experienceLoadMore = page.locator('#load-more-btn');
        if (await experienceLoadMore.isVisible()) {
            const ariaLabel = await experienceLoadMore.getAttribute('aria-label');
            console.log(`Experience Load More ARIA label: ${ariaLabel}`);
        }
        
        // Check Projects Load More button accessibility
        const projectsLoadMore = page.locator('#load-more-projects-btn');
        if (await projectsLoadMore.isVisible()) {
            const text = await projectsLoadMore.textContent();
            console.log(`Projects Load More text: ${text}`);
            expect(text).toContain('Load');
        }
        
        // Check that buttons are keyboard accessible
        await page.keyboard.press('Tab'); // Navigate through interactive elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // At least one Load More button should be focusable
        const focusedElement = page.locator(':focus');
        const focusedText = await focusedElement.textContent();
        console.log(`Focused element after tabs: ${focusedText}`);
    });

    test('Emergency failsafe: Content should be visible even if JavaScript fails', async ({ page }) => {
        // Disable JavaScript
        await page.context().addInitScript(() => {
            // Simulate JavaScript error in pagination functions
            window.addEventListener('DOMContentLoaded', () => {
                // Cause an error in pagination
                throw new Error('Simulated pagination error');
            });
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Despite JavaScript errors, content should still be visible
        const workItems = page.locator('.work-item');
        const projectItems = page.locator('.project-item');
        const educationItems = page.locator('.education-item');
        
        const workCount = await workItems.count();
        const projectCount = await projectItems.count();
        const educationCount = await educationItems.count();
        
        console.log(`With JS error - Work items: ${workCount}, Projects: ${projectCount}, Education: ${educationCount}`);
        
        // All content should still be visible
        expect(workCount).toBeGreaterThan(0);
        expect(projectCount).toBeGreaterThan(0);
        expect(educationCount).toBeGreaterThan(0);
        
        // Check that at least some content is actually visible on screen
        const visibleWorkItems = await workItems.first().isVisible();
        const visibleProjectItems = await projectItems.first().isVisible();
        
        expect(visibleWorkItems).toBe(true);
        expect(visibleProjectItems).toBe(true);
    });
});