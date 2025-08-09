const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureScreenshots() {
    console.log('📸 Final mobile UX screenshots...');
    
    // Create evidence directory
    const evidenceDir = path.join(__dirname, 'visual-evidence', 'final-mobile-ux');
    await fs.mkdir(evidenceDir, { recursive: true });
    
    const browser = await chromium.launch();
    
    try {
        // iPhone 16 Pro Max screenshots
        const mobileContext = await browser.newContext({
            viewport: { width: 430, height: 932 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        });
        
        const mobilePage = await mobileContext.newPage();
        await mobilePage.goto('http://localhost:3000');
        await mobilePage.waitForLoadState('networkidle');
        
        // Header with new download button (closed)
        console.log('📸 Header - new download button closed...');
        await mobilePage.screenshot({
            path: path.join(evidenceDir, '1_header_download_closed.png'),
            fullPage: false,
            clip: { x: 0, y: 0, width: 430, height: 600 }
        });
        
        // Click download button to show menu
        await mobilePage.click('#download-toggle');
        await mobilePage.waitForTimeout(300);
        
        // Header with download menu open (including QR option)
        console.log('📸 Header - download menu open with QR...');
        await mobilePage.screenshot({
            path: path.join(evidenceDir, '2_header_download_menu_open.png'),
            fullPage: false,
            clip: { x: 0, y: 0, width: 430, height: 600 }
        });
        
        // Close menu
        await mobilePage.click('body');
        await mobilePage.waitForTimeout(300);
        
        // Experience section with integrated counter
        console.log('📸 Experience section with integrated counter...');
        await mobilePage.locator('#experience-section').screenshot({
            path: path.join(evidenceDir, '3_experience_integrated_counter.png')
        });
        
        // Full page - no floating QR button
        console.log('📸 Full page - no floating button...');
        await mobilePage.screenshot({
            path: path.join(evidenceDir, '4_full_page_clean.png'),
            fullPage: true
        });
        
        await mobileContext.close();
        
        console.log('✅ Final screenshots saved to:', evidenceDir);
        
    } catch (error) {
        console.error('❌ Screenshot error:', error);
    } finally {
        await browser.close();
    }
}

captureScreenshots().catch(console.error);