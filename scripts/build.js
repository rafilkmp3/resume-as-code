const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');
const { copyRecursive } = require('./utils/fs-utils');

console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Generate QR code for the online version
async function generateQRCode(url, options) {
  console.log('🔗 Generating QR code for online version...');
  try {
    return await QRCode.toDataURL(url, options);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

// Generate HTML from template and data
async function generateHTML(resumeData, templatePath) {
  console.log('📝 Generating HTML from template...');
  
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource);
  
  // Register a helper to stringify JSON
  Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
  });

  // Register a helper for equality comparison
  Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
  });

  // Copy assets directory to dist
  copyAssets(resumeData);
  
  // Generate QR code
  const qrCodeDataURL = await generateQRCode(resumeData.basics.url, {
    width: 200,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  // Replace the placeholder QR code with the real one
  let html = template(resumeData);
  if (qrCodeDataURL) {
    html = html.replace(
      /src="data:image\/png;base64,[^"]*"/,
      `src="${qrCodeDataURL}"`
    );
    console.log('✅ QR code integrated successfully!');
  }
  
  // Update app version and environment from package.json and CI environment
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const appVersion = packageJson.version;
  const buildBranch = process.env.GITHUB_REF_NAME || process.env.BRANCH || 'main';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.GITHUB_REF_NAME === 'main' || process.env.GITHUB_ACTIONS;
  const environment = isProduction && buildBranch === 'main' ? 'production' : 'preview';
  
  // Replace version placeholders in HTML
  html = html.replace(/const appVersion = '[^']*';/, `const appVersion = '${appVersion}';`);
  html = html.replace(/const branchName = isProduction \? 'main' : 'preview';/, 
    `const branchName = '${buildBranch}';`);
  html = html.replace(/<span id="app-version">[\d.]+<\/span>/, 
    `<span id="app-version">${appVersion}</span>`);
  html = html.replace(/<span id="app-environment">[^<]*<\/span>/, 
    `<span id="app-environment">${environment}</span>`);
    
  console.log(`🔖 App version: ${appVersion} (${environment} on ${buildBranch})`);
  
  fs.writeFileSync('./dist/index.html', html);
  
  console.log('✅ HTML generated successfully!');
}

// Copy assets to the dist folder
function copyAssets(resumeData) {
  const assetsDir = './assets';
  const distAssetsDir = './dist/assets';
  
  if (fs.existsSync(assetsDir)) {
    // Create assets directory in dist
    if (!fs.existsSync(distAssetsDir)) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    }
    
    copyRecursive(assetsDir, distAssetsDir);
    console.log('📁 Copied assets directory to dist/');
  }
  
  // Also copy profile image if it exists (backward compatibility)
  if (resumeData.basics.image && fs.existsSync(resumeData.basics.image)) {
    const imagePath = resumeData.basics.image;
    const destPath = `./dist/${imagePath}`;
    const destDir = path.dirname(destPath);
    
    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(imagePath, destPath);
    console.log(`📸 Copied profile image: ${imagePath}`);
  }
}

// Generate PDF from HTML
async function generatePDF(resumeData) {
  try {
    if (!fs.existsSync('./dist/index.html')) {
      console.log('⚠️  HTML file not found, skipping PDF generation');
      return;
    }

    console.log('📄 Generating multiple PDF versions...');
    console.log('⏱️  PDF generation timeout: 60 seconds');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-running-insecure-content']
    });
    
    const filePath = path.resolve('./dist/index.html');

    // 1. Screen-Optimized PDF (Default - good-looking version)
    await generateScreenOptimizedPDF(browser, filePath, resumeData);
    
    // 2. Print-Optimized PDF (Enhanced for physical printing)
    await generatePrintOptimizedPDF(browser, filePath, resumeData);
    
    // 3. ATS-Optimized PDF (Simplified for ATS systems)
    await generateATSOptimizedPDF(browser, filePath, resumeData);

    await browser.close();
    console.log('✅ All PDF versions generated successfully!');
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.log('⚠️  Continuing without PDF...');
  }
}

// Screen-Optimized PDF - Beautiful version for online sharing
async function generateScreenOptimizedPDF(browser, filePath, resumeData) {
  console.log('📱 Generating Screen-Optimized PDF...');
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for images and animations
  await page.waitForSelector('img', { timeout: 5000 }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Disable JavaScript pagination and show all content for PDF
  await page.evaluate(() => {
    // Force light mode for PDF
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    
    // Show all items immediately - all sections
    document.querySelectorAll('.work-item, .project-item, .education-item, .skill-category-item').forEach(item => {
      item.style.display = 'block';
      item.style.visibility = 'visible';
      item.classList.remove('hidden');
    });
    
    // Hide all pagination and interactive controls
    document.querySelectorAll('.load-more-container, .load-more-btn, .experience-counter, .experience-controls, .skills-counter, .education-counter, .no-print, .dark-toggle').forEach(el => {
      el.style.display = 'none !important';
    });
  });
  
  // Set screen media type for full visual experience
  await page.emulateMediaType('screen');
  
  // Inject CSS to optimize for screen viewing with proper light mode and better spacing
  await page.addStyleTag({
    content: `
      /* Force light mode styles for PDF */
      :root {
        --color-background: #ffffff !important;
        --color-text: #000000 !important;
        --color-text-muted: #666666 !important;
        --color-surface: #ffffff !important;
        --color-border: #e5e7eb !important;
      }
      
      [data-theme="light"] {
        --color-background: #ffffff !important;
        --color-text: #000000 !important;
      }
      
      body { 
        background: white !important; 
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .parallax-bg { display: none !important; }
      .fade-in-section { opacity: 1 !important; transform: none !important; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }
      
      /* Reduce excessive spacing in main content */
      .main-content {
        padding: 1rem !important;
        gap: 1rem !important;
        min-height: auto !important;
      }
      
      .section {
        margin-bottom: 1rem !important;
        page-break-inside: avoid;
      }
      
      .container {
        min-height: auto !important;
        padding: 0 !important;
      }
      
      /* Make sections more compact */
      .left-column, .right-column {
        gap: 1rem !important;
      }
      
      .work-item, .project-item {
        margin-bottom: 1rem !important;
      }
    `
  });
  
  await page.emulateMediaType('print');
  
  await page.pdf({
    path: './dist/resume.pdf',
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    scale: 0.95,
    tagged: true,
    title: `${resumeData.basics.name} - Resume (Screen-Optimized)`,
    author: resumeData.basics.name,
    subject: `${resumeData.basics.label} - Screen-Optimized Version`,
    keywords: (resumeData.basics.keywords || []).join(', '),
    creator: 'Resume-as-Code System',
    producer: 'Puppeteer PDF Generator'
  });
  
  await page.close();
  console.log('✅ Screen-Optimized PDF completed');
}

// Print-Optimized PDF - Enhanced for physical printing
async function generatePrintOptimizedPDF(browser, filePath, resumeData) {
  console.log('🖨️  Generating Print-Optimized PDF...');
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  await page.waitForSelector('img', { timeout: 5000 }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Disable JavaScript pagination and show all content for PDF
  await page.evaluate(() => {
    // Force light mode for PDF
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    
    // Show all items immediately - all sections
    document.querySelectorAll('.work-item, .project-item, .education-item, .skill-category-item').forEach(item => {
      item.style.display = 'block';
      item.style.visibility = 'visible';
      item.classList.remove('hidden');
    });
    
    // Hide all pagination and interactive controls
    document.querySelectorAll('.load-more-container, .load-more-btn, .experience-counter, .experience-controls, .skills-counter, .education-counter, .no-print, .dark-toggle').forEach(el => {
      el.style.display = 'none !important';
    });
  });
  
  // Inject CSS optimizations for physical printing
  await page.addStyleTag({
    content: `
      @media print {
        * { -webkit-print-color-adjust: exact !important; }
        body { 
          background: white !important;
          font-size: 11pt !important;
          line-height: 1.3 !important;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          -webkit-print-color-adjust: exact !important;
          color: white !important;
          print-color-adjust: exact !important;
        }
        .section-title {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin-top: 12pt !important;
          margin-bottom: 8pt !important;
          color: #2c3e50 !important;
        }
        .experience-item, .project-item {
          margin-bottom: 10pt !important;
          page-break-inside: avoid !important;
        }
        .contact-info {
          font-size: 10pt !important;
        }
        /* Enhanced contrast for printing */
        p, li, span { color: #000 !important; }
        .subtitle { font-size: 12pt !important; }
      }
    `
  });
  
  await page.emulateMediaType('print');
  
  await page.pdf({
    path: './dist/resume-print.pdf',
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
    scale: 1.0,
    tagged: true,
    title: `${resumeData.basics.name} - Resume (Print-Optimized)`,
    author: resumeData.basics.name,
    subject: `${resumeData.basics.label} - Print-Optimized Version`,
    keywords: (resumeData.basics.keywords || []).join(', '),
    creator: 'Resume-as-Code System',
    producer: 'Puppeteer PDF Generator'
  });
  
  await page.close();
  console.log('✅ Print-Optimized PDF completed');
}

// ATS-Optimized PDF - Simplified for ATS systems
async function generateATSOptimizedPDF(browser, filePath, resumeData) {
  console.log('🤖 Generating ATS-Optimized PDF...');
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  await page.waitForSelector('img', { timeout: 5000 }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Disable JavaScript pagination during PDF generation
  await page.evaluate(() => {
    // Force light mode for PDF
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    
    // Disable all pagination JavaScript completely
    window.initializeExperiencePagination = () => {};
    window.initializeProjectsPagination = () => {};
    window.initializeEducationPagination = () => {};
    window.initializeSkillsPagination = () => {};
    
    // Force show ALL items and remove any hidden classes
    document.querySelectorAll('.work-item, .project-item, .education-item, .skill-category-item, .fade-in-section').forEach(item => {
      item.style.display = 'block !important';
      item.style.visibility = 'visible !important';
      item.classList.remove('hidden');
      item.classList.remove('fade-in');
      item.setAttribute('style', 'display: block !important; visibility: visible !important;');
    });
    
    // Hide all pagination controls completely
    document.querySelectorAll('.load-more-container, .load-more-btn, .experience-counter, .experience-controls, .skills-counter, .education-counter, .no-print, .dark-toggle').forEach(el => {
      el.style.display = 'none !important';
      el.style.visibility = 'hidden !important';
    });
    
    // Remove any height restrictions that might be causing spacing issues
    document.querySelectorAll('*').forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.minHeight !== 'auto' && computed.minHeight !== '0px') {
        el.style.minHeight = 'auto';
      }
    });
  });

  // Inject CSS for ATS optimization - clean, simple, text-focused with better spacing
  await page.addStyleTag({
    content: `
      @media print {
        * { 
          background: white !important;
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        body {
          font-family: 'Times New Roman', serif !important;
          font-size: 10pt !important;
          line-height: 1.15 !important;
          margin: 8pt !important;
          padding: 0 !important;
        }
        .header {
          background: white !important;
          color: #000 !important;
          text-align: center !important;
          border-bottom: 2px solid #000 !important;
          padding: 10pt 0 !important;
          margin-bottom: 15pt !important;
        }
        .header h1 {
          font-size: 18pt !important;
          font-weight: bold !important;
          margin: 0 0 5pt 0 !important;
          color: #000 !important;
        }
        .subtitle {
          font-size: 14pt !important;
          margin: 0 0 10pt 0 !important;
          color: #000 !important;
        }
        .contact-info {
          font-size: 11pt !important;
          text-align: center !important;
          margin: 10pt 0 !important;
          display: block !important;
        }
        .contact-item {
          display: inline !important;
          margin: 0 10pt !important;
        }
        .section-title {
          font-size: 12pt !important;
          font-weight: bold !important;
          margin: 4pt 0 2pt 0 !important;
          border-bottom: 1px solid #000 !important;
          padding-bottom: 1pt !important;
          text-transform: uppercase !important;
          color: #000 !important;
        }
        .experience-item, .project-item, .education-item {
          margin: 2pt 0 !important;
          page-break-inside: avoid !important;
          page-break-before: avoid !important;
          page-break-after: avoid !important;
        }
        .experience-title, .project-name, .education-degree {
          font-weight: bold !important;
          font-size: 12pt !important;
          color: #000 !important;
        }
        .experience-company, .project-url, .education-institution {
          font-style: italic !important;
          color: #000 !important;
        }
        .experience-duration, .project-duration, .education-duration {
          float: right !important;
          color: #000 !important;
        }
        ul, ol { margin: 5pt 0 !important; }
        li { margin: 2pt 0 !important; color: #000 !important; }
        
        /* Hide visual elements for ATS */
        .profile-photo, .parallax-bg, .dark-toggle, .controls, .links,
        .fade-in-section::before, .gradient-text, .print-only,
        .print-qr-section, .pdf-download-group { display: none !important; }
        
        /* Ensure all text is black and readable */
        p, span, div, li, td, th, h2, h3, h4, h5, h6 {
          color: #000 !important;
          background: transparent !important;
        }
        
        /* Simple, clean layout with better page breaks */
        .main-content {
          display: block !important;
          column-count: 1 !important;
          page-break-inside: auto !important;
        }
        .left-column, .right-column {
          width: 100% !important;
          float: none !important;
          column-count: 1 !important;
          display: block !important;
        }
        
        /* Remove all page break controls - let content flow naturally */
        .fade-in-section, .work-item, .project-item, .education-item {
          page-break-inside: auto !important;
          break-inside: auto !important;
          page-break-before: auto !important;
          page-break-after: auto !important;
          margin-bottom: 3pt !important;
        }
        
        /* Only minimal spacing and flow control */
        .section-title {
          margin: 8pt 0 4pt 0 !important;
          page-break-after: auto !important;
          break-after: auto !important;
        }
        
        /* Hide pagination elements in ATS */
        .experience-counter, .experience-controls,
        .load-more-container, .load-more-btn,
        .section-controls, .load-more-projects-btn,
        .projects-counter { display: none !important; }
        
        /* Force show all content items */
        .work-item, .project-item, .fade-in-section {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        .work-item.hidden, .project-item.hidden {
          display: block !important;
          visibility: visible !important;
        }
      }
    `
  });
  
  await page.emulateMediaType('print');
  
  await page.pdf({
    path: './dist/resume-ats.pdf',
    format: 'A4',
    printBackground: false, // Disable backgrounds for ATS
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    scale: 1.0,
    tagged: true,
    title: `${resumeData.basics.name} - Resume (ATS-Optimized)`,
    author: resumeData.basics.name,
    subject: `${resumeData.basics.label} - ATS-Optimized Version`,
    keywords: (resumeData.basics.keywords || []).join(', '),
    creator: 'Resume-as-Code System - ATS Optimized',
    producer: 'Puppeteer PDF Generator'
  });
  
  await page.close();
  console.log('✅ ATS-Optimized PDF completed');
}

// Run the build
async function build() {
  const resumeData = JSON.parse(fs.readFileSync('./resume-data.json', 'utf8'));
  await generateHTML(resumeData, './template.html');
  
  // Generate PDF with timeout to prevent CI hanging
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PDF generation timeout (60s)')), 60000)
    );
    
    await Promise.race([generatePDF(resumeData), timeout]);
  } catch (error) {
    console.error('⚠️  PDF generation failed or timed out:', error.message);
    console.log('✅ HTML generation completed - continuing without PDF');
  }
  
  console.log('🎉 Resume build complete!');
  console.log('📁 Files generated in ./dist/');
  console.log('🌐 HTML: ./dist/index.html');
  
  // Report all PDF versions generated
  const pdfVersions = [
    { file: './dist/resume.pdf', name: 'Screen-Optimized PDF', icon: '📱' },
    { file: './dist/resume-print.pdf', name: 'Print-Optimized PDF', icon: '🖨️' },
    { file: './dist/resume-ats.pdf', name: 'ATS-Optimized PDF', icon: '🤖' }
  ];
  
  let pdfCount = 0;
  pdfVersions.forEach(pdf => {
    if (fs.existsSync(pdf.file)) {
      console.log(`${pdf.icon} ${pdf.name}: ${pdf.file}`);
      pdfCount++;
    }
  });
  
  if (pdfCount === 0) {
    console.log('📄 PDFs: Not generated (HTML-only build)');
  } else {
    console.log(`📄 Total PDF versions generated: ${pdfCount}/3`);
  }
}

build().catch(console.error);
