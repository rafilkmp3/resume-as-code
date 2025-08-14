#!/usr/bin/env node

/**
 * Theme Testing Tool
 * Tests both light and dark themes and takes screenshots
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🌗 Theme Testing Tool');
console.log('=====================\n');

async function testThemes() {
    const browser = await puppeteer.launch({ headless: false, devtools: false });
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

    // Test Light Theme
    console.log('\n☀️ Testing Light Theme...');
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    });

    await page.waitForSelector('body', { timeout: 1000 });

    // Take light theme screenshots
    await page.screenshot({
        path: './debug-screenshots/light-theme-full.png',
        fullPage: true
    });

    // Focus on contact section for light theme
    const contactSection = await page.$('#contact');
    if (contactSection) {
        await contactSection.screenshot({
            path: './debug-screenshots/light-contact-section.png'
        });
    }

    // Test button styling in light theme
    const lightButtonStyles = await page.evaluate(() => {
        const primaryBtn = document.querySelector('.liquid-action-btn.liquid-primary');
        const secondaryBtn = document.querySelector('.liquid-action-btn.liquid-secondary');
        const githubIcon = document.querySelector('img[src*="github"]');

        return {
            primaryBtnBg: primaryBtn ? getComputedStyle(primaryBtn).background : 'N/A',
            secondaryBtnBg: secondaryBtn ? getComputedStyle(secondaryBtn).background : 'N/A',
            githubIconSrc: githubIcon ? githubIcon.src : 'N/A'
        };
    });

    console.log('  ✅ Light theme buttons:');
    console.log('    Primary background:', lightButtonStyles.primaryBtnBg.substring(0, 50) + '...');
    console.log('    Secondary background:', lightButtonStyles.secondaryBtnBg.substring(0, 50) + '...');
    console.log('    GitHub icon:', lightButtonStyles.githubIconSrc.includes('FFFFFF') ? '✅ WHITE' : '❌ DARK');

    // Test Dark Theme
    console.log('\n🌙 Testing Dark Theme...');
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
    });

    await page.waitForSelector('body', { timeout: 1000 });

    // Take dark theme screenshots
    await page.screenshot({
        path: './debug-screenshots/dark-theme-full.png',
        fullPage: true
    });

    // Focus on contact section for dark theme
    if (contactSection) {
        await contactSection.screenshot({
            path: './debug-screenshots/dark-contact-section.png'
        });
    }

    // Test button styling in dark theme
    const darkButtonStyles = await page.evaluate(() => {
        const primaryBtn = document.querySelector('.liquid-action-btn.liquid-primary');
        const secondaryBtn = document.querySelector('.liquid-action-btn.liquid-secondary');

        return {
            primaryBtnBg: primaryBtn ? getComputedStyle(primaryBtn).background : 'N/A',
            secondaryBtnBg: secondaryBtn ? getComputedStyle(secondaryBtn).background : 'N/A'
        };
    });

    console.log('  ✅ Dark theme buttons:');
    console.log('    Primary background:', darkButtonStyles.primaryBtnBg.substring(0, 50) + '...');
    console.log('    Secondary background:', darkButtonStyles.secondaryBtnBg.substring(0, 50) + '...');

    console.log('\n📸 Screenshots saved to debug-screenshots/');
    console.log('✅ Theme testing complete!');

    await browser.close();
}

// Create debug directory
const debugDir = './debug-screenshots';
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
}

testThemes().catch(console.error);
