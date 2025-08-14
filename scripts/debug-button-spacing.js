#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugButtonSpacing() {
    console.log('🔍 DEBUGGING QR BUTTON SPACING ISSUE');
    console.log('=====================================');

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Load the built HTML file
    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Wait for elements to load
    await page.waitForSelector('.liquid-contact-grid', { timeout: 5000 });

    console.log('📊 COMPARING BUTTON SPACING...\n');

    // Get computed styles for all contact cards
    const buttonData = await page.evaluate(() => {
        const cards = document.querySelectorAll('.liquid-contact-card');
        const results = [];

        cards.forEach((card, index) => {
            const cardContent = card.querySelector('.liquid-card-content');
            const icon = card.querySelector('.liquid-icon');
            const text = card.querySelector('.liquid-text h3');

            if (cardContent && icon && text) {
                const cardStyle = window.getComputedStyle(cardContent);
                const iconStyle = window.getComputedStyle(icon);
                const textStyle = window.getComputedStyle(text);

                // Get positions
                const cardRect = cardContent.getBoundingClientRect();
                const iconRect = icon.getBoundingClientRect();
                const textRect = text.getBoundingClientRect();

                results.push({
                    index: index,
                    id: card.id || 'no-id',
                    title: text.textContent,
                    cardGap: cardStyle.gap,
                    cardDisplay: cardStyle.display,
                    iconWidth: iconStyle.width,
                    iconMarginRight: iconStyle.marginRight,
                    iconPaddingRight: iconStyle.paddingRight,
                    textMarginLeft: textStyle.marginLeft,
                    textPaddingLeft: textStyle.paddingLeft,
                    // Calculate actual spacing between icon and text
                    actualSpacing: textRect.left - iconRect.right,
                    iconLeft: iconRect.left - cardRect.left,
                    textLeft: textRect.left - cardRect.left,
                    element: card.tagName
                });
            }
        });

        return results;
    });

    console.log('🎯 DETAILED SPACING ANALYSIS:\n');

    buttonData.forEach(button => {
        console.log(`${button.index + 1}. ${button.title} (${button.element}${button.id ? '#' + button.id : ''})`);
        console.log(`   Gap: ${button.cardGap}`);
        console.log(`   Icon Width: ${button.iconWidth}`);
        console.log(`   Actual Spacing: ${Math.round(button.actualSpacing)}px`);
        console.log(`   Icon Position: ${Math.round(button.iconLeft)}px`);
        console.log(`   Text Position: ${Math.round(button.textLeft)}px`);
        console.log('');
    });

    // Find the problematic QR button
    const qrButton = buttonData.find(b => b.id === 'share-qr-btn' || b.title.includes('QR'));
    const normalButton = buttonData.find(b => b.title === 'Email'); // Use as reference

    if (qrButton && normalButton) {
        console.log('⚠️  COMPARISON ANALYSIS:');
        console.log(`QR Button spacing: ${Math.round(qrButton.actualSpacing)}px`);
        console.log(`Normal Button spacing: ${Math.round(normalButton.actualSpacing)}px`);
        console.log(`Difference: ${Math.round(qrButton.actualSpacing - normalButton.actualSpacing)}px`);

        if (Math.abs(qrButton.actualSpacing - normalButton.actualSpacing) > 2) {
            console.log('🚨 SPACING INCONSISTENCY CONFIRMED!');
        } else {
            console.log('✅ Spacing appears consistent');
        }
    }

    await browser.close();
}

debugButtonSpacing().catch(console.error);
