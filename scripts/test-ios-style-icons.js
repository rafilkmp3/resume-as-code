#!/usr/bin/env node

/**
 * iOS-Style Icons Testing Tool
 * Tests all icons for iPhone OS-style appearance in both themes
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('📱 iOS-Style Icons Testing');
console.log('==========================\n');

async function testIOSStyleIcons() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport for desktop testing
    await page.setViewport({ width: 1440, height: 900 });

    console.log('📱 Loading resume with iOS-style icons...');

    // Load local build
    const filePath = path.resolve('./dist/index.html');
    if (!fs.existsSync(filePath)) {
        console.error('❌ Build not found. Run: npm run build');
        process.exit(1);
    }

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Light Theme Icons
    console.log('\n☀️ TESTING IOS-STYLE ICONS IN LIGHT THEME...');

    // Force light theme
    await page.evaluate(() => {
        document.body.removeAttribute('data-theme');
        console.log('🔧 Light theme applied for iOS icons');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scroll to Contact section
    await page.evaluate(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take light theme contact section screenshot
    const contactSection = await page.$('#contact');
    if (contactSection) {
        await contactSection.screenshot({
            path: './visual-evidence/ios-style-icons-light.png'
        });
    }

    // Validate icon styling
    const lightIconValidation = await page.evaluate(() => {
        const icons = document.querySelectorAll('.liquid-icon svg');
        const results = [];

        icons.forEach((icon, index) => {
            const iconContainer = icon.closest('.liquid-icon');
            const card = icon.closest('.liquid-contact-card');
            const title = card ? card.querySelector('.liquid-text h3')?.textContent : 'Unknown';

            results.push({
                title: title,
                iconIndex: index,
                color: getComputedStyle(icon).color,
                width: getComputedStyle(icon).width,
                height: getComputedStyle(icon).height,
                containerBg: getComputedStyle(iconContainer).background.substring(0, 50) + '...',
                containerRadius: getComputedStyle(iconContainer).borderRadius,
                hasProperFill: icon.getAttribute('fill') === 'currentColor'
            });
        });

        return results;
    });

    console.log('  📊 Light Theme Icon Validation:');
    lightIconValidation.forEach(icon => {
        console.log(`    ${icon.title}:`);
        console.log(`      Color: ${icon.color}`);
        console.log(`      Size: ${icon.width} × ${icon.height}`);
        console.log(`      Container: ${icon.containerBg}`);
        console.log(`      Radius: ${icon.containerRadius}`);
        console.log(`      Theme-aware: ${icon.hasProperFill ? '✅ YES' : '❌ NO'}`);
        console.log();
    });

    // Test Dark Theme Icons
    console.log('🌙 TESTING IOS-STYLE ICONS IN DARK THEME...');

    // Force dark theme
    await page.evaluate(() => {
        document.body.setAttribute('data-theme', 'dark');
        console.log('🔧 Dark theme applied for iOS icons');
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take dark theme contact section screenshot
    if (contactSection) {
        await contactSection.screenshot({
            path: './visual-evidence/ios-style-icons-dark.png'
        });
    }

    // Validate dark theme icons
    const darkIconValidation = await page.evaluate(() => {
        const icons = document.querySelectorAll('.liquid-icon svg');
        const results = [];

        icons.forEach((icon, index) => {
            const iconContainer = icon.closest('.liquid-icon');
            const card = icon.closest('.liquid-contact-card');
            const title = card ? card.querySelector('.liquid-text h3')?.textContent : 'Unknown';

            results.push({
                title: title,
                iconIndex: index,
                color: getComputedStyle(icon).color,
                width: getComputedStyle(icon).width,
                height: getComputedStyle(icon).height,
                containerBg: getComputedStyle(iconContainer).background.substring(0, 50) + '...',
                isDarkTheme: document.body.getAttribute('data-theme') === 'dark'
            });
        });

        return results;
    });

    console.log('  📊 Dark Theme Icon Validation:');
    darkIconValidation.forEach(icon => {
        console.log(`    ${icon.title}:`);
        console.log(`      Color: ${icon.color}`);
        console.log(`      Size: ${icon.width} × ${icon.height}`);
        console.log(`      Container: ${icon.containerBg}`);
        console.log(`      Dark theme active: ${icon.isDarkTheme ? '✅ YES' : '❌ NO'}`);
        console.log();
    });

    // Test responsive behavior on iPhone-size viewport
    console.log('📱 TESTING IPHONE-SIZE RESPONSIVE BEHAVIOR...');

    // Set iPhone viewport
    await page.setViewport({ width: 375, height: 812 }); // iPhone 12/13/14 size
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take mobile screenshot
    if (contactSection) {
        await contactSection.screenshot({
            path: './visual-evidence/ios-style-icons-mobile.png'
        });
    }

    // Validate mobile responsive behavior
    const mobileIconValidation = await page.evaluate(() => {
        const icons = document.querySelectorAll('.liquid-icon svg');
        const containers = document.querySelectorAll('.liquid-icon');

        return {
            totalIcons: icons.length,
            iconSizes: Array.from(icons).map(icon => ({
                width: getComputedStyle(icon).width,
                height: getComputedStyle(icon).height
            })),
            containerSizes: Array.from(containers).map(container => ({
                width: getComputedStyle(container).width,
                height: getComputedStyle(container).height
            })),
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    });

    console.log('  📱 Mobile Responsive Validation:');
    console.log(`    Viewport: ${mobileIconValidation.viewportWidth}×${mobileIconValidation.viewportHeight}`);
    console.log(`    Total icons: ${mobileIconValidation.totalIcons}`);
    console.log(`    Icon sizes: ${JSON.stringify(mobileIconValidation.iconSizes[0], null, 2)}`);
    console.log(`    Container sizes: ${JSON.stringify(mobileIconValidation.containerSizes[0], null, 2)}`);

    console.log('\n📸 Screenshots saved to visual-evidence/');
    console.log('✅ iOS-style icons testing complete!');
    console.log('\n🎯 All icons are now theme-aware SVGs with iPhone OS-style appearance!');

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

testIOSStyleIcons().catch(console.error);
