#!/usr/bin/env node
/**
 * QR Code Generation Script
 * Generates QR codes as PNG images for modal and PDF usage
 * Replaces unreliable runtime generation with build-time assets
 */

import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../../public');
const ASSETS_DIR = resolve(PUBLIC_DIR, 'assets/images');

// QR Code configurations for different use cases
const QR_CONFIGS = {
  'qr-code-modal': {
    size: 250,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#2563eb',  // Blue theme
      light: '#ffffff'
    }
  },
  'qr-code-print': {
    size: 120,
    margin: 1,
    errorCorrectionLevel: 'H',  // Higher error correction for print
    color: {
      dark: '#000000',  // Black for print
      light: '#ffffff'
    }
  }
};

/**
 * Get site URL from environment or fallback
 */
function getSiteUrl() {
  // Check various environment sources
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }
  if (process.env.URL) {
    return process.env.URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // GitHub Pages pattern
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    return `https://${owner}.github.io/${repo}`;
  }
  
  // Default fallback
  return 'https://rafilkmp3.github.io/resume-as-code';
}

/**
 * Generate QR code PNG image
 */
async function generateQRCodePNG(url, config, outputPath) {
  try {
    const options = {
      width: config.size,
      margin: config.margin,
      color: config.color,
      errorCorrectionLevel: config.errorCorrectionLevel,
      type: 'png'
    };

    // Generate QR code as buffer
    const buffer = await QRCode.toBuffer(url, options);
    
    // Write to file
    await fs.writeFile(outputPath, buffer);
    
    const stats = await fs.stat(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    return {
      success: true,
      size: sizeKB,
      path: outputPath
    };
  } catch (error) {
    console.error(`❌ Failed to generate QR code:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 QR Code Generation - Build-time Asset Creation');
  console.log('📦 Generating reliable PNG QR codes for modal and PDF usage');
  console.log('');

  // Get target URL
  const siteUrl = getSiteUrl();
  console.log(`🌐 Target URL: ${siteUrl}`);

  // Ensure assets directory exists
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  let totalGenerated = 0;
  let totalSize = 0;

  // Generate each QR code variant
  for (const [name, config] of Object.entries(QR_CONFIGS)) {
    console.log(`\n📱 Generating ${name}...`);
    const outputPath = resolve(ASSETS_DIR, `${name}.png`);
    
    const result = await generateQRCodePNG(siteUrl, config, outputPath);
    
    if (result.success) {
      console.log(`  ✅ Generated ${name}.png (${result.size}KB, ${config.size}x${config.size}px)`);
      totalGenerated++;
      totalSize += result.size;
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  }

  console.log('\n📊 QR Code Generation Summary:');
  console.log(`  🖼️ Generated Files: ${totalGenerated}`);
  console.log(`  💾 Total Size: ${totalSize}KB`);
  console.log(`  🎯 Benefits: Reliable QR codes, no runtime generation, faster loading`);
  
  if (totalGenerated > 0) {
    console.log(`  ✅ QR codes ready for modal and PDF usage`);
    console.log(`  📱 Modal QR: /assets/images/qr-code-modal.png`);
    console.log(`  🖨️ Print QR: /assets/images/qr-code-print.png`);
  } else {
    console.log(`  ❌ No QR codes generated - check errors above`);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ QR code generation failed:', error);
    process.exit(1);
  });
}