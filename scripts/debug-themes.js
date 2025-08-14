#!/usr/bin/env node

/**
 * Enhanced Theme Testing Tool with Proper Validation
 * Forces theme changes and validates they're applied correctly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🌗 Enhanced Theme Debug Tool');
console.log('===============================\n');

async function debugThemes() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport for desktop testing
    await page.setViewport({ width: 1280, height: 720 });

    console.log('📱 Loading resume page...');

    // Load local build
    const filePath = path.resolve('./dist/index.html');
    if (!fs.existsSync(filePath)) {
        console.error('❌ Build not found. Run: npm run build');
        process.exit(1);
    }

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Light Theme - FORCE IT
    console.log('\n☀️ TESTING LIGHT THEME...');

    // Force light theme with correct method
    await page.evaluate(() => {
        // CORRECT METHOD: Remove data-theme attribute from body for light theme
        document.body.removeAttribute('data-theme');

        // Remove any theme classes
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');

        console.log('🔧 LIGHT THEME FORCED (CORRECT METHOD)');
        console.log('Body theme attribute:', document.body.getAttribute('data-theme'));
        console.log('HTML classes:', document.documentElement.className);
        console.log('Body classes:', document.body.className);
    });

    // Wait longer for CSS to recalculate
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Validate light theme is applied
    const lightThemeValidation = await page.evaluate(() => {
        const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const containerBg = getComputedStyle(document.querySelector('.container') || document.body).backgroundColor;

        return {
            bodyDataTheme: document.body.getAttribute('data-theme'),
            htmlDataTheme: document.documentElement.getAttribute('data-theme'),
            htmlBg,
            bodyBg,
            containerBg,
            isLight: htmlBg.includes('255') || bodyBg.includes('255') || containerBg.includes('255') || containerBg.includes('white')
        };
    });

    console.log('  📊 Light Theme Validation:');
    console.log('    body data-theme:', lightThemeValidation.bodyDataTheme);
    console.log('    html data-theme:', lightThemeValidation.htmlDataTheme);
    console.log('    HTML background:', lightThemeValidation.htmlBg);
    console.log('    Body background:', lightThemeValidation.bodyBg);
    console.log('    Container background:', lightThemeValidation.containerBg);
    console.log('    Is Light?', lightThemeValidation.isLight ? '✅ YES' : '❌ NO');

    // Take light theme screenshots
    await page.screenshot({
        path: './visual-evidence/light-theme-full-debug.png',
        fullPage: true
    });

    // Focus on contact section for light theme
    const contactSection = await page.$('#contact');
    if (contactSection) {
        await contactSection.screenshot({
            path: './visual-evidence/light-contact-section-debug.png'
        });
    }

    // Test Dark Theme - FORCE IT
    console.log('\n🌙 TESTING DARK THEME...');

    // Force dark theme with correct method
    await page.evaluate(() => {
        // CORRECT METHOD: Set data-theme="dark" on body for dark theme
        document.body.setAttribute('data-theme', 'dark');

        // Remove any light classes
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');

        console.log('🔧 DARK THEME FORCED (CORRECT METHOD)');
        console.log('Body theme attribute:', document.body.getAttribute('data-theme'));
        console.log('HTML classes:', document.documentElement.className);
        console.log('Body classes:', document.body.className);
    });

    // Wait longer for CSS to recalculate
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Validate dark theme is applied
    const darkThemeValidation = await page.evaluate(() => {
        const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const containerBg = getComputedStyle(document.querySelector('.container') || document.body).backgroundColor;

        return {
            bodyDataTheme: document.body.getAttribute('data-theme'),
            htmlDataTheme: document.documentElement.getAttribute('data-theme'),
            htmlBg,
            bodyBg,
            containerBg,
            isDark: htmlBg.includes('0, 0, 0') || bodyBg.includes('0, 0, 0') ||
                   containerBg.includes('33, 33, 33') || containerBg.includes('26, 26, 26') ||
                   containerBg.includes('24, 24, 27') || bodyBg === 'rgb(0, 0, 0)'
        };
    });

    console.log('  📊 Dark Theme Validation:');
    console.log('    body data-theme:', darkThemeValidation.bodyDataTheme);
    console.log('    html data-theme:', darkThemeValidation.htmlDataTheme);
    console.log('    HTML background:', darkThemeValidation.htmlBg);
    console.log('    Body background:', darkThemeValidation.bodyBg);
    console.log('    Container background:', darkThemeValidation.containerBg);
    console.log('    Is Dark?', darkThemeValidation.isDark ? '✅ YES' : '❌ NO');

    // Take dark theme screenshots
    await page.screenshot({
        path: './visual-evidence/dark-theme-full-debug.png',
        fullPage: true
    });

    // Focus on contact section for dark theme
    if (contactSection) {
        await contactSection.screenshot({
            path: './visual-evidence/dark-contact-section-debug.png'
        });
    }

    // Test liquid glass cards in both themes
    const cardValidation = await page.evaluate(() => {
        const downloadCard = document.querySelector('.liquid-contact-card[href*="resume.pdf"]');
        const shareCard = document.querySelector('.liquid-contact-card#share-qr-btn');
        const githubIcon = document.querySelector('img[src*="github"]');

        return {
            downloadCardExists: !!downloadCard,
            shareCardExists: !!shareCard,
            githubIconSrc: githubIcon ? githubIcon.src : 'N/A',
            githubIconWhite: githubIcon ? githubIcon.src.includes('FFFFFF') : false
        };
    });

    console.log('\n🔧 Liquid Glass Cards Validation:');
    console.log('    Download PDF Card:', cardValidation.downloadCardExists ? '✅ EXISTS' : '❌ MISSING');
    console.log('    Share QR Card:', cardValidation.shareCardExists ? '✅ EXISTS' : '❌ MISSING');
    console.log('    GitHub Icon Color:', cardValidation.githubIconWhite ? '✅ WHITE' : '❌ DARK');

    console.log('\n📸 Screenshots saved to visual-evidence/');
    console.log('✅ Enhanced theme debugging complete!');

    await browser.close();
}

// Create visual-evidence directory (consistent with Docker setup)
const debugDir = './visual-evidence';
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
}

debugThemes().catch(console.error);
