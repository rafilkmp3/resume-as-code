#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugFullContact() {
    console.log('📐 FULL CONTACT SECTION DEBUG');
    console.log('============================');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.waitForSelector('.liquid-contact-grid', { timeout: 5000 });

    // Scroll to contact section
    await page.evaluate(() => {
        document.querySelector('#contact').scrollIntoView();
    });

    // Add debug overlays
    await page.addStyleTag({
        content: `
            .debug-icon-boundary {
                border: 2px solid red !important;
                position: relative !important;
            }

            .debug-text-boundary {
                border: 2px solid blue !important;
                position: relative !important;
            }

            .debug-card-boundary {
                border: 3px solid green !important;
            }

            .debug-gap-line {
                position: absolute;
                background: yellow;
                height: 100%;
                width: 2px;
                opacity: 0.8;
                z-index: 9999;
            }
        `
    });

    // Get detailed measurements
    const measurements = await page.evaluate(() => {
        const cards = document.querySelectorAll('.liquid-contact-card');
        const results = [];

        cards.forEach((card, index) => {
            const cardContent = card.querySelector('.liquid-card-content');
            const icon = card.querySelector('.liquid-icon');
            const text = card.querySelector('.liquid-text');
            const h3 = card.querySelector('.liquid-text h3');

            if (icon && text && h3) {
                // Add visual boundaries
                icon.classList.add('debug-icon-boundary');
                text.classList.add('debug-text-boundary');
                card.classList.add('debug-card-boundary');

                const cardRect = cardContent.getBoundingClientRect();
                const iconRect = icon.getBoundingClientRect();
                const textRect = text.getBoundingClientRect();
                const h3Rect = h3.getBoundingClientRect();

                results.push({
                    index: index,
                    title: h3.textContent,
                    id: card.id,
                    element: card.tagName,
                    cardWidth: Math.round(cardRect.width),
                    iconLeft: Math.round(iconRect.left - cardRect.left),
                    iconRight: Math.round(iconRect.right - cardRect.left),
                    textLeft: Math.round(textRect.left - cardRect.left),
                    h3Left: Math.round(h3Rect.left - cardRect.left),
                    actualGap: Math.round(textRect.left - iconRect.right),
                    h3Gap: Math.round(h3Rect.left - iconRect.right)
                });

                // Add gap line visualization
                const gapLine = document.createElement('div');
                gapLine.className = 'debug-gap-line';
                gapLine.style.left = (iconRect.right - cardRect.left) + 'px';
                gapLine.style.top = '0px';
                gapLine.style.position = 'absolute';
                cardContent.appendChild(gapLine);
            }
        });

        return results;
    });

    console.log('📊 DETAILED MEASUREMENTS:');
    measurements.forEach(m => {
        console.log(`${m.index + 1}. ${m.title} (${m.element}${m.id ? '#' + m.id : ''})`);
        console.log(`   Card Width: ${m.cardWidth}px`);
        console.log(`   Icon Position: 0-${m.iconRight}px`);
        console.log(`   Text Position: ${m.textLeft}px`);
        console.log(`   H3 Position: ${m.h3Left}px`);
        console.log(`   Gap: ${m.actualGap}px`);
        console.log('');
    });

    // Find QR button anomaly
    const qrButton = measurements.find(m => m.id === 'share-qr-btn' || m.title.includes('QR'));
    const avgGap = measurements.reduce((sum, m) => sum + m.actualGap, 0) / measurements.length;

    if (qrButton) {
        console.log('🎯 QR BUTTON ANALYSIS:');
        console.log(`QR Gap: ${qrButton.actualGap}px`);
        console.log(`Average Gap: ${Math.round(avgGap)}px`);
        console.log(`Difference: ${Math.round(qrButton.actualGap - avgGap)}px`);
    }

    // Take full screenshot
    await page.screenshot({
        path: 'visual-evidence/debug-full-contact-measurements.png',
        fullPage: false,
        clip: { x: 0, y: 420, width: 900, height: 800 }
    });

    console.log('✅ Debug screenshot: visual-evidence/debug-full-contact-measurements.png');

    await browser.close();
}

debugFullContact().catch(console.error);
