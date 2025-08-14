#!/usr/bin/env node

/**
 * Enhanced QR Modal Aesthetics Testing Tool
 * Tests the dramatically improved liquid glass QR modal in both themes
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🎨 Enhanced QR Modal Aesthetics Test');
console.log('=====================================\n');

async function testEnhancedQRModal() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport for optimal testing
    await page.setViewport({ width: 1440, height: 900 });

    console.log('📱 Loading resume with enhanced QR modal...');

    // Load local build
    const filePath = path.resolve('./dist/index.html');
    if (!fs.existsSync(filePath)) {
        console.error('❌ Build not found. Run: npm run build');
        process.exit(1);
    }

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Light Theme QR Modal
    console.log('\n☀️ TESTING ENHANCED LIGHT THEME QR MODAL...');

    // Force light theme
    await page.evaluate(() => {
        document.body.removeAttribute('data-theme');
        console.log('🔧 Light theme applied');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Open QR Modal in light theme
    console.log('  📱 Opening QR modal...');
    await page.click('#share-qr-btn');
    await page.waitForSelector('.qr-modal.show', { timeout: 3000 });

    // Wait for animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take light theme modal screenshot
    await page.screenshot({
        path: './visual-evidence/enhanced-qr-modal-light.png',
        fullPage: false
    });

    // Take detailed modal-only screenshot
    const lightModal = await page.$('.qr-modal-content');
    if (lightModal) {
        await lightModal.screenshot({
            path: './visual-evidence/enhanced-qr-modal-light-detail.png'
        });
    }

    console.log('  ✅ Light theme modal screenshots captured');

    // Close modal
    await page.click('.qr-modal-close');
    await page.waitForSelector('.qr-modal:not(.show)', { timeout: 2000 });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test Dark Theme QR Modal
    console.log('\n🌙 TESTING ENHANCED DARK THEME QR MODAL...');

    // Force dark theme
    await page.evaluate(() => {
        document.body.setAttribute('data-theme', 'dark');
        console.log('🔧 Dark theme applied');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Open QR Modal in dark theme
    console.log('  📱 Opening QR modal in dark mode...');
    await page.click('#share-qr-btn');
    await page.waitForSelector('.qr-modal.show', { timeout: 3000 });

    // Wait for enhanced animations to complete
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Take dark theme modal screenshot
    await page.screenshot({
        path: './visual-evidence/enhanced-qr-modal-dark.png',
        fullPage: false
    });

    // Take detailed dark modal-only screenshot
    const darkModal = await page.$('.qr-modal-content');
    if (darkModal) {
        await darkModal.screenshot({
            path: './visual-evidence/enhanced-qr-modal-dark-detail.png'
        });
    }

    console.log('  ✅ Dark theme modal screenshots captured');

    // Test hover effects on close button and title icon
    console.log('\n🖱️  Testing enhanced hover effects...');

    // Hover over close button
    await page.hover('.qr-modal-close');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.screenshot({
        path: './visual-evidence/enhanced-qr-modal-close-hover.png',
        fullPage: false
    });

    // Hover over title icon
    await page.hover('.qr-title-icon');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.screenshot({
        path: './visual-evidence/enhanced-qr-modal-title-hover.png',
        fullPage: false
    });

    // Test QR code hover effect
    await page.hover('.qr-code-large');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.screenshot({
        path: './visual-evidence/enhanced-qr-code-hover.png',
        fullPage: false
    });

    console.log('  ✅ Enhanced hover effects captured');

    // Validate enhanced styling elements
    const stylingValidation = await page.evaluate(() => {
        const modal = document.querySelector('.qr-modal');
        const modalContent = document.querySelector('.qr-modal-content');
        const modalInner = document.querySelector('.qr-modal-inner');
        const closeBtn = document.querySelector('.qr-modal-close');
        const titleIcon = document.querySelector('.qr-title-icon');
        const qrContainer = document.querySelector('.qr-code-container');
        const qrCode = document.querySelector('.qr-code-large');

        const modalBg = getComputedStyle(modal).background;
        const modalContentShadow = getComputedStyle(modalContent).boxShadow;
        const modalInnerBg = getComputedStyle(modalInner).background;
        const closeBtnBg = getComputedStyle(closeBtn).background;
        const titleIconBg = getComputedStyle(titleIcon).background;
        const qrContainerBg = getComputedStyle(qrContainer).background;
        const backdropFilter = getComputedStyle(modal).backdropFilter;

        return {
            modalBg: modalBg.substring(0, 50) + '...',
            modalContentShadow: modalContentShadow !== 'none',
            modalInnerBg: modalInnerBg.substring(0, 50) + '...',
            closeBtnBg: closeBtnBg.substring(0, 50) + '...',
            titleIconBg: titleIconBg.substring(0, 50) + '...',
            qrContainerBg: qrContainerBg.substring(0, 50) + '...',
            hasBackdropFilter: backdropFilter !== 'none',
            modalRadius: getComputedStyle(modalContent).borderRadius,
            qrCodePadding: getComputedStyle(qrCode).padding
        };
    });

    console.log('\n🎨 Enhanced Styling Validation:');
    console.log('    Modal background:', stylingValidation.modalBg);
    console.log('    Content has shadow:', stylingValidation.modalContentShadow ? '✅ YES' : '❌ NO');
    console.log('    Inner background:', stylingValidation.modalInnerBg);
    console.log('    Close button styling:', stylingValidation.closeBtnBg);
    console.log('    Title icon styling:', stylingValidation.titleIconBg);
    console.log('    QR container styling:', stylingValidation.qrContainerBg);
    console.log('    Backdrop filter active:', stylingValidation.hasBackdropFilter ? '✅ YES' : '❌ NO');
    console.log('    Modal border radius:', stylingValidation.modalRadius);
    console.log('    QR code padding:', stylingValidation.qrCodePadding);

    console.log('\n📸 Screenshots saved to visual-evidence/');
    console.log('✅ Enhanced QR modal aesthetics testing complete!');

    await browser.close();
}

// Create visual-evidence directory and clean old screenshots
const debugDir = './visual-evidence';
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
} else {
    // Clean all existing screenshots before taking new ones
    console.log('🧹 Cleaning old visual evidence...');
    const files = fs.readdirSync(debugDir);
    const imageFiles = files.filter(file => file.match(/\.(png|jpg|jpeg|gif|webp)$/i));

    imageFiles.forEach(file => {
        const filePath = path.join(debugDir, file);
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Deleted: ${file}`);
    });

    if (imageFiles.length > 0) {
        console.log(`✅ Cleaned ${imageFiles.length} old screenshots\n`);
    } else {
        console.log('✅ No old screenshots to clean\n');
    }
}

testEnhancedQRModal().catch(console.error);
