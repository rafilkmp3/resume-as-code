#!/usr/bin/env node

/**
 * Build Validation Test
 * 
 * Ultra-lightweight test that runs as part of the build process
 * to catch PDF route regressions before deployment. No browser needed!
 * 
 * Usage:
 *   node tests/build-validation.js
 *   npm run test:build
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';

const REQUIRED_FILES = [
  'app/utils/qr-code.ts',
  'app/pages/pdf-screen.astro',
  'app/pages/pdf-print.astro',
  'app/pages/pdf-ats.astro'
];

const SECURITY_CHECKS = [
  { pattern: 'api.qrserver.com', message: 'External QR API still present!' },
  { pattern: 'ajv-cli', message: 'Vulnerable ajv-cli dependency found!' },
  { pattern: 'puppeteer', message: 'Heavy puppeteer dependency found!' }
];

const REQUIRED_PATTERNS = [
  { file: 'pdf-screen.astro', pattern: 'QRCodePresets.screen', message: 'Screen QR preset missing' },
  { file: 'pdf-print.astro', pattern: 'QRCodePresets.print', message: 'Print QR preset missing' },
  { file: 'pdf-ats.astro', pattern: 'QRCodePresets.ats', message: 'ATS QR preset missing' },
  { file: 'qr-code.ts', pattern: 'generateQRCodeDataURL', message: 'QR generation function missing' }
];

async function runBuildValidation() {
  console.log('🔍 Build Validation - PDF Routes Security Check');
  console.log('='.repeat(50));
  
  let errors = 0;
  let warnings = 0;
  
  // Check required files exist
  console.log('\n📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    try {
      const filePath = resolve(process.cwd(), file);
      await readFile(filePath, 'utf8');
      console.log(`✅ ${file}`);
    } catch (error) {
      console.error(`❌ Missing: ${file}`);
      errors++;
    }
  }
  
  // Security validation
  console.log('\n🔐 Security validation...');
  try {
    const packagePath = resolve(process.cwd(), 'package.json');
    const packageContent = await readFile(packagePath, 'utf8');
    
    for (const check of SECURITY_CHECKS) {
      if (packageContent.includes(check.pattern)) {
        console.error(`❌ ${check.message}`);
        errors++;
      } else {
        console.log(`✅ No ${check.pattern} found`);
      }
    }
    
    // Check qrcode dependency is present
    const pkg = JSON.parse(packageContent);
    if (pkg.dependencies?.qrcode) {
      console.log('✅ Secure qrcode dependency present');
    } else {
      console.error('❌ Missing qrcode dependency');
      errors++;
    }
  } catch (error) {
    console.error('❌ Could not validate package.json');
    errors++;
  }
  
  // Pattern validation
  console.log('\n📝 Pattern validation...');
  for (const check of REQUIRED_PATTERNS) {
    try {
      let filePath;
      if (check.file === 'qr-code.ts') {
        filePath = resolve(process.cwd(), 'app', 'utils', check.file);
      } else {
        filePath = resolve(process.cwd(), 'app', 'pages', check.file);
      }
      
      const content = await readFile(filePath, 'utf8');
      
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.file}: ${check.pattern}`);
      } else {
        console.error(`❌ ${check.file}: ${check.message}`);
        errors++;
      }
    } catch (error) {
      console.error(`❌ Could not validate ${check.file}: ${error.message}`);
      errors++;
    }
  }
  
  // Quick QR test (if possible)
  console.log('\n🎯 Quick QR generation test...');
  try {
    const { generateQRCodeDataURL } = await import('../app/utils/qr-code.ts');
    const testQR = await generateQRCodeDataURL('test');
    
    if (testQR.startsWith('data:image/png;base64,')) {
      console.log('✅ QR generation works');
    } else {
      console.error('❌ QR generation produces invalid output');
      errors++;
    }
  } catch (error) {
    console.error('❌ QR generation failed:', error.message);
    errors++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors > 0) {
    console.error(`❌ Build validation FAILED: ${errors} errors, ${warnings} warnings`);
    console.error('PDF routes are not ready for deployment!');
    process.exit(1);
  } else {
    console.log(`✅ Build validation PASSED: ${errors} errors, ${warnings} warnings`);
    console.log('🚀 PDF routes are ready for deployment!');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBuildValidation().catch(error => {
    console.error('❌ Build validation crashed:', error.message);
    process.exit(1);
  });
}

export { runBuildValidation };