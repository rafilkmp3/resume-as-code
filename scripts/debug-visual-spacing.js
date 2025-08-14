#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugVisualSpacing() {
    console.log('📐 VISUAL SPACING DEBUG WITH GRID OVERLAYS');
    console.log('==========================================');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.waitForSelector('.liquid-contact-grid', { timeout: 5000 });

    // Add visual debugging overlays
    await page.addStyleTag({
        content: `
            /* Debug overlay styles */
            .debug-overlay {
                position: absolute;
                pointer-events: none;
                z-index: 9999;
            }

            .debug-icon-boundary {
                border: 2px solid red !important;
                box-shadow: inset 0 0 0 2px rgba(255, 0, 0, 0.3) !important;
            }

            .debug-text-boundary {
                border: 2px solid blue !important;
                box-shadow: inset 0 0 0 2px rgba(0, 0, 255, 0.3) !important;
            }

            .debug-gap-measurement {
                position: absolute;
                background: yellow;
                height: 100%;
                opacity: 0.7;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: black;
            }
        `
    });

    // Add debug overlays and measurements
    await page.evaluate(() => {
        const cards = document.querySelectorAll('.liquid-contact-card');

        cards.forEach((card, index) => {
            const icon = card.querySelector('.liquid-icon');
            const textDiv = card.querySelector('.liquid-text');

            if (icon && textDiv) {
                // Add visual boundaries
                icon.classList.add('debug-icon-boundary');
                textDiv.classList.add('debug-text-boundary');

                // Measure actual gap
                const iconRect = icon.getBoundingClientRect();
                const textRect = textDiv.getBoundingClientRect();
                const actualGap = textRect.left - iconRect.right;

                // Create gap measurement overlay
                const gapDiv = document.createElement('div');
                gapDiv.className = 'debug-gap-measurement';
                gapDiv.textContent = Math.round(actualGap) + 'px';
                gapDiv.style.left = iconRect.right + 'px';
                gapDiv.style.top = iconRect.top + 'px';
                gapDiv.style.width = actualGap + 'px';
                gapDiv.style.position = 'fixed';

                document.body.appendChild(gapDiv);
            }
        });
    });

    console.log('📸 Taking debug screenshot with visual overlays...');

    // Take screenshot with overlays
    await page.screenshot({
        path: 'visual-evidence/debug-spacing-overlay.png',
        fullPage: false,
        clip: { x: 0, y: 300, width: 900, height: 600 }
    });

    console.log('✅ Debug screenshot saved: visual-evidence/debug-spacing-overlay.png');

    await browser.close();
}

debugVisualSpacing().catch(console.error);
