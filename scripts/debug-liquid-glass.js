#!/usr/bin/env node

/**
 * Liquid Glass Debug Tool
 * Tests and debugs the Contact & Connect section liquid glass implementation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🧪 Liquid Glass Debug Tool');
console.log('==============================\n');

async function debugLiquidGlass() {
    const browser = await puppeteer.launch({ headless: false, devtools: true });
    const page = await browser.newPage();

    // Set viewport for testing
    await page.setViewport({ width: 1280, height: 720 });

    console.log('📱 Loading resume page...');

    // Load local build
    const filePath = path.resolve('./dist/index.html');
    if (!fs.existsSync(filePath)) {
        console.error('❌ Build not found. Run: npm run build');
        process.exit(1);
    }

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    console.log('🔍 Running liquid glass diagnostics...\n');

    // Test 1: Check if liquid glass CSS is loaded
    console.log('1️⃣ Testing CSS Variables...');
    const cssVars = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
            glassBlurPrimary: styles.getPropertyValue('--glass-blur-primary').trim(),
            glassHighlight: styles.getPropertyValue('--glass-highlight').trim(),
            spacingXxl: styles.getPropertyValue('--spacing-xxl').trim()
        };
    });

    console.log('  CSS Variables:', cssVars);
    console.log('  ✅ Glass blur:', cssVars.glassBlurPrimary ? 'LOADED' : '❌ MISSING');
    console.log('  ✅ Glass highlight:', cssVars.glassHighlight ? 'LOADED' : '❌ MISSING');
    console.log('  ✅ Spacing system:', cssVars.spacingXxl ? 'LOADED' : '❌ MISSING');

    // Test 2: Check DOM structure
    console.log('\n2️⃣ Testing DOM Structure...');
    const domStructure = await page.evaluate(() => {
        const grid = document.querySelector('.liquid-contact-grid');
        const cards = document.querySelectorAll('.liquid-contact-card');
        const icons = document.querySelectorAll('.liquid-icon');
        const texts = document.querySelectorAll('.liquid-text');

        return {
            gridExists: !!grid,
            cardCount: cards.length,
            iconCount: icons.length,
            textCount: texts.length,
            gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : 'N/A'
        };
    });

    console.log('  Grid container:', domStructure.gridExists ? '✅ FOUND' : '❌ MISSING');
    console.log('  Contact cards:', domStructure.cardCount, 'found');
    console.log('  Icons:', domStructure.iconCount, 'found');
    console.log('  Text containers:', domStructure.textCount, 'found');
    console.log('  Grid columns:', domStructure.gridColumns);

    // Test 3: Check computed styles
    console.log('\n3️⃣ Testing Applied Styles...');
    const computedStyles = await page.evaluate(() => {
        const card = document.querySelector('.liquid-contact-card');
        const icon = document.querySelector('.liquid-icon');

        if (!card) return { error: 'No contact card found' };

        const cardStyles = getComputedStyle(card);
        const iconStyles = icon ? getComputedStyle(icon) : null;

        return {
            cardBackdropFilter: cardStyles.backdropFilter,
            cardBackground: cardStyles.background,
            cardBorderRadius: cardStyles.borderRadius,
            cardPadding: cardStyles.padding,
            iconWidth: iconStyles ? iconStyles.width : 'N/A',
            iconHeight: iconStyles ? iconStyles.height : 'N/A',
            iconBorderRadius: iconStyles ? iconStyles.borderRadius : 'N/A'
        };
    });

    console.log('  Card backdrop-filter:', computedStyles.cardBackdropFilter);
    console.log('  Card background:', computedStyles.cardBackground.substring(0, 50) + '...');
    console.log('  Card border-radius:', computedStyles.cardBorderRadius);
    console.log('  Card padding:', computedStyles.cardPadding);
    console.log('  Icon size:', `${computedStyles.iconWidth} x ${computedStyles.iconHeight}`);
    console.log('  Icon border-radius:', computedStyles.iconBorderRadius);

    // Test 4: Theme switching
    console.log('\n4️⃣ Testing Theme Support...');

    // Test dark theme
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
    });

    await page.waitForSelector('body', { timeout: 1000 });

    const darkThemeStyles = await page.evaluate(() => {
        const card = document.querySelector('.liquid-contact-card');
        const cardStyles = getComputedStyle(card);
        return {
            background: cardStyles.background,
            boxShadow: cardStyles.boxShadow
        };
    });

    console.log('  Dark theme - Background:', darkThemeStyles.background.substring(0, 50) + '...');
    console.log('  Dark theme - Box Shadow:', darkThemeStyles.boxShadow.substring(0, 50) + '...');

    // Switch back to light
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    });

    // Test 5: Hover effects
    console.log('\n5️⃣ Testing Hover Effects...');

    const hoverTest = await page.evaluate(() => {
        const card = document.querySelector('.liquid-contact-card');
        if (!card) return { error: 'No card found' };

        // Simulate hover
        card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

        const hoveredStyles = getComputedStyle(card);
        return {
            transform: hoveredStyles.transform,
            transition: hoveredStyles.transition
        };
    });

    console.log('  Hover transform:', hoverTest.transform);
    console.log('  Transition:', hoverTest.transition);

    // Test 6: Visual screenshot
    console.log('\n6️⃣ Taking Debug Screenshots...');

    // Full page
    await page.screenshot({
        path: './debug-screenshots/liquid-glass-full.png',
        fullPage: true
    });

    // Focus on contact section
    const contactSection = await page.$('#contact');
    if (contactSection) {
        await contactSection.screenshot({
            path: './debug-screenshots/contact-section-focus.png'
        });
    }

    console.log('  📸 Screenshots saved to debug-screenshots/');

    console.log('\n✅ Debug complete! Check results above and screenshots.');
    console.log('🌐 Browser window will stay open for manual inspection...');

    // Keep browser open for manual inspection
    await new Promise(resolve => {
        console.log('\n👀 Press Ctrl+C to close browser and exit...');
        process.on('SIGINT', () => {
            browser.close();
            resolve();
        });
    });
}

// Create debug directory
const debugDir = './debug-screenshots';
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
}

debugLiquidGlass().catch(console.error);
