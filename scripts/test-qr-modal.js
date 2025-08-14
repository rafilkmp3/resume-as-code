#!/usr/bin/env node

/**
 * QR Code Modal Testing Tool
 * Tests QR code readability and modal functionality in both themes
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🔍 QR Code Modal Testing Tool');
console.log('============================\n');

async function testQRModal() {
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
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test Light Theme QR Modal
    console.log('\n☀️ TESTING QR MODAL - LIGHT THEME...');

    // Force light theme
    await page.evaluate(() => {
        document.body.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click QR Code button to open modal
    const qrButton = await page.$('#share-qr-btn');
    if (qrButton) {
        await qrButton.click();
        console.log('  ✅ QR Code button clicked');

        // Wait for modal to open and QR code to generate
        await page.waitForSelector('.qr-modal.show', { timeout: 5000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get QR code properties
        const qrInfo = await page.evaluate(() => {
            const modal = document.querySelector('#qr-modal');
            const canvas = document.querySelector('#qr-code-image');
            const modalContent = document.querySelector('.qr-modal-content');

            if (!modal || !canvas || !modalContent) {
                return { error: 'QR modal elements not found' };
            }

            const modalStyles = getComputedStyle(modalContent);
            const canvasStyles = getComputedStyle(canvas);

            // Get canvas context to analyze QR code colors
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Sample some pixels to check contrast
            const samplePixels = [];
            for (let i = 0; i < imageData.data.length; i += 4) {
                samplePixels.push({
                    r: imageData.data[i],
                    g: imageData.data[i + 1],
                    b: imageData.data[i + 2],
                    a: imageData.data[i + 3]
                });
                if (samplePixels.length >= 100) break; // Sample first 100 pixels
            }

            return {
                modalVisible: modal.classList.contains('show'),
                modalBackground: modalStyles.backgroundColor,
                modalBackdropFilter: modalStyles.backdropFilter,
                canvasBackground: canvasStyles.backgroundColor,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                samplePixels: samplePixels.slice(0, 10), // First 10 pixels
                bodyTheme: document.body.getAttribute('data-theme')
            };
        });

        console.log('  📊 Light Theme QR Modal Analysis:');
        console.log('    Modal Visible:', qrInfo.modalVisible ? '✅ YES' : '❌ NO');
        console.log('    Modal Background:', qrInfo.modalBackground);
        console.log('    Canvas Background:', qrInfo.canvasBackground);
        console.log('    Canvas Dimensions:', `${qrInfo.canvasWidth}x${qrInfo.canvasHeight}`);
        console.log('    Body Theme:', qrInfo.bodyTheme || 'light');

        // Take screenshot of QR modal in light theme
        await page.screenshot({
            path: './visual-evidence/qr-modal-light-theme.png',
            fullPage: false
        });

        // Close modal
        const closeButton = await page.$('#qr-modal-close');
        if (closeButton) {
            await closeButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Test Dark Theme QR Modal
    console.log('\n🌙 TESTING QR MODAL - DARK THEME...');

    // Force dark theme
    await page.evaluate(() => {
        document.body.setAttribute('data-theme', 'dark');
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click QR Code button to open modal in dark theme
    if (qrButton) {
        await qrButton.click();
        console.log('  ✅ QR Code button clicked (dark theme)');

        // Wait for modal to open and QR code to generate
        await page.waitForSelector('.qr-modal.show', { timeout: 5000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get QR code properties in dark theme
        const qrInfoDark = await page.evaluate(() => {
            const modal = document.querySelector('#qr-modal');
            const canvas = document.querySelector('#qr-code-image');
            const modalContent = document.querySelector('.qr-modal-content');

            if (!modal || !canvas || !modalContent) {
                return { error: 'QR modal elements not found' };
            }

            const modalStyles = getComputedStyle(modalContent);
            const canvasStyles = getComputedStyle(canvas);

            // Get canvas context to analyze QR code colors
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Check if QR code has proper contrast in dark theme
            let darkPixels = 0;
            let lightPixels = 0;

            // Sample pixels to analyze contrast
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const brightness = (r + g + b) / 3;

                if (brightness < 128) darkPixels++;
                else lightPixels++;

                if (darkPixels + lightPixels >= 1000) break; // Sample 1000 pixels
            }

            return {
                modalVisible: modal.classList.contains('show'),
                modalBackground: modalStyles.backgroundColor,
                modalBackdropFilter: modalStyles.backdropFilter,
                canvasBackground: canvasStyles.backgroundColor,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                darkPixels,
                lightPixels,
                contrastRatio: lightPixels / (darkPixels + lightPixels),
                bodyTheme: document.body.getAttribute('data-theme'),
                hasGoodContrast: (lightPixels > 0 && darkPixels > 0) && (lightPixels / (darkPixels + lightPixels) > 0.3)
            };
        });

        console.log('  📊 Dark Theme QR Modal Analysis:');
        console.log('    Modal Visible:', qrInfoDark.modalVisible ? '✅ YES' : '❌ NO');
        console.log('    Modal Background:', qrInfoDark.modalBackground);
        console.log('    Canvas Background:', qrInfoDark.canvasBackground);
        console.log('    Canvas Dimensions:', `${qrInfoDark.canvasWidth}x${qrInfoDark.canvasHeight}`);
        console.log('    Dark Pixels:', qrInfoDark.darkPixels);
        console.log('    Light Pixels:', qrInfoDark.lightPixels);
        console.log('    Contrast Ratio:', qrInfoDark.contrastRatio?.toFixed(2));
        console.log('    Good Contrast?', qrInfoDark.hasGoodContrast ? '✅ YES' : '❌ NO - QR CODE NOT READABLE');
        console.log('    Body Theme:', qrInfoDark.bodyTheme);

        // Take screenshot of QR modal in dark theme
        await page.screenshot({
            path: './visual-evidence/qr-modal-dark-theme.png',
            fullPage: false
        });

        // Take focused screenshot of just the QR code canvas
        const qrCanvas = await page.$('#qr-code-image');
        if (qrCanvas) {
            await qrCanvas.screenshot({
                path: './visual-evidence/qr-code-canvas-dark.png'
            });
        }
    }

    console.log('\n📸 Screenshots saved to visual-evidence/');
    console.log('✅ QR Code modal testing complete!');

    await browser.close();
}

// Create visual-evidence directory
const debugDir = './visual-evidence';
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
}

testQRModal().catch(console.error);
