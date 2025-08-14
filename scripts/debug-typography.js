#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugTypography() {
    console.log('🔤 TYPOGRAPHY ANALYSIS - QR Button vs Others');
    console.log('===========================================');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.waitForSelector('.liquid-contact-grid', { timeout: 5000 });

    const typographyData = await page.evaluate(() => {
        const cards = document.querySelectorAll('.liquid-contact-card');
        const results = [];

        cards.forEach((card, index) => {
            const h3 = card.querySelector('.liquid-text h3');
            const p = card.querySelector('.liquid-text p');

            if (h3) {
                const h3Style = window.getComputedStyle(h3);
                const pStyle = p ? window.getComputedStyle(p) : null;

                results.push({
                    index: index,
                    id: card.id || 'no-id',
                    title: h3.textContent,
                    subtitle: p ? p.textContent : 'none',
                    element: card.tagName,
                    h3FontFamily: h3Style.fontFamily,
                    h3FontSize: h3Style.fontSize,
                    h3FontWeight: h3Style.fontWeight,
                    h3LetterSpacing: h3Style.letterSpacing,
                    h3TextTransform: h3Style.textTransform,
                    h3Color: h3Style.color,
                    h3MarginLeft: h3Style.marginLeft,
                    h3MarginRight: h3Style.marginRight,
                    h3PaddingLeft: h3Style.paddingLeft,
                    h3PaddingRight: h3Style.paddingRight,
                    pFontSize: pStyle ? pStyle.fontSize : 'none',
                    pFontWeight: pStyle ? pStyle.fontWeight : 'none',
                    pMarginTop: pStyle ? pStyle.marginTop : 'none'
                });
            }
        });

        return results;
    });

    console.log('📊 TYPOGRAPHY COMPARISON:\n');

    const qrButton = typographyData.find(t => t.id === 'share-qr-btn' || t.title.includes('QR'));
    const emailButton = typographyData.find(t => t.title === 'Email');

    if (qrButton && emailButton) {
        console.log('🎯 QR Button vs Email Button Comparison:');
        console.log('');

        const properties = [
            'element', 'h3FontFamily', 'h3FontSize', 'h3FontWeight',
            'h3LetterSpacing', 'h3Color', 'h3MarginLeft', 'h3MarginRight',
            'h3PaddingLeft', 'h3PaddingRight'
        ];

        properties.forEach(prop => {
            const qrValue = qrButton[prop];
            const emailValue = emailButton[prop];
            const different = qrValue !== emailValue;

            console.log(`${prop}:`);
            console.log(`  Email: ${emailValue}`);
            console.log(`  QR:    ${qrValue} ${different ? '⚠️  DIFFERENT!' : '✅'}`);
            console.log('');
        });
    }

    // Check for any unusual values
    console.log('🔍 UNUSUAL TYPOGRAPHY VALUES:');
    typographyData.forEach(item => {
        if (item.h3LetterSpacing !== 'normal' && item.h3LetterSpacing !== '0px') {
            console.log(`${item.title}: Letter spacing = ${item.h3LetterSpacing}`);
        }
        if (item.h3MarginLeft !== '0px' || item.h3MarginRight !== '0px') {
            console.log(`${item.title}: Margins = ${item.h3MarginLeft} / ${item.h3MarginRight}`);
        }
        if (item.h3PaddingLeft !== '0px' || item.h3PaddingRight !== '0px') {
            console.log(`${item.title}: Padding = ${item.h3PaddingLeft} / ${item.h3PaddingRight}`);
        }
    });

    await browser.close();
}

debugTypography().catch(console.error);
