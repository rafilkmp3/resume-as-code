#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);
const distDir = join(rootDir, 'dist');

/**
 * Generate PDFs from Astro HTML pages using Puppeteer
 * Creates static PDF files for deployment
 */
async function generatePDFs() {
  console.log('🚀 Starting PDF generation...');
  
  // Check if dist directory exists
  if (!existsSync(distDir)) {
    console.error('❌ dist/ directory not found. Run build first.');
    process.exit(1);
  }
  
  // Check if HTML pages exist
  const pdfPages = [
    { name: 'screen', path: 'pdf-screen/index.html', output: 'resume.pdf' },
    { name: 'print', path: 'pdf-print/index.html', output: 'resume-print.pdf' }, 
    { name: 'ats', path: 'pdf-ats/index.html', output: 'resume-ats.pdf' }
  ];
  
  let browser;
  let generatedCount = 0;
  
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps'
      ]
    });
    
    for (const pdfConfig of pdfPages) {
      const htmlPath = join(distDir, pdfConfig.path);
      const pdfOutputPath = join(distDir, pdfConfig.output);
      
      console.log(`📄 Generating ${pdfConfig.name} PDF...`);
      
      if (!existsSync(htmlPath)) {
        console.warn(`⚠️  HTML page not found: ${htmlPath}`);
        continue;
      }
      
      const page = await browser.newPage();
      
      try {
        // Load the HTML file
        const htmlContent = readFileSync(htmlPath, 'utf8');
        const fileUrl = `file://${htmlPath}`;
        
        console.log(`   Loading: ${fileUrl}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        // Configure PDF options based on type
        let pdfOptions = {
          path: pdfOutputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.5in',
            bottom: '0.5in', 
            left: '0.5in',
            right: '0.5in'
          }
        };
        
        // Optimize for specific PDF types
        if (pdfConfig.name === 'print') {
          pdfOptions.margin = {
            top: '0.3in',
            bottom: '0.3in',
            left: '0.3in', 
            right: '0.3in'
          };
        } else if (pdfConfig.name === 'ats') {
          pdfOptions.format = 'Letter';
          pdfOptions.margin = {
            top: '0.75in',
            bottom: '0.75in',
            left: '0.75in',
            right: '0.75in'
          };
        }
        
        // Generate PDF
        await page.pdf(pdfOptions);
        
        console.log(`   ✅ Created: ${pdfConfig.output}`);
        generatedCount++;
        
      } catch (error) {
        console.error(`   ❌ Failed to generate ${pdfConfig.name} PDF:`, error.message);
      } finally {
        await page.close();
      }
    }
    
    console.log(`\n📊 PDF Generation Summary:`);
    console.log(`   Generated: ${generatedCount}/${pdfPages.length} PDFs`);
    console.log(`   Output directory: ${distDir}`);
    
    if (generatedCount === 0) {
      console.error('❌ No PDFs were generated successfully');
      process.exit(1);
    } else if (generatedCount < pdfPages.length) {
      console.warn(`⚠️  Only ${generatedCount}/${pdfPages.length} PDFs generated`);
      process.exit(0); // Don't fail build, but warn
    } else {
      console.log('✅ All PDFs generated successfully!');
    }
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run PDF generation
generatePDFs();