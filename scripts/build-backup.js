const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');
const sharp = require('sharp');
const { copyRecursive } = require('./utils/fs-utils');
const { optimizeProfileImageForResume } = require('./utils/image-optimization');

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

// DRY Profile Image Optimization using utility
async function optimizeProfileImage(imagePath, resumeData, options = {}) {
  console.log('🖼️  Optimizing profile image for web performance...');

  const profileImagePath = imagePath;
  const distImagesDir = './dist/assets/images';

  if (!fs.existsSync(profileImagePath)) {
    console.log('⚠️  Profile image not found, skipping optimization');
    return null;
  }

  // Ensure dist images directory exists
  if (!fs.existsSync(distImagesDir)) {
    fs.mkdirSync(distImagesDir, { recursive: true });
  }

  try {
    const originalImage = sharp(profileImagePath);
    const metadata = await originalImage.metadata();

    console.log(`📏 Original image: ${metadata.width}x${metadata.height}, ${metadata.format}, ${Math.round(metadata.size / 1024)}KB`);

    // Create multiple optimized versions for different use cases
    const optimizations = [
      {
        name: 'desktop',
        width: 150,
        height: 150,
        quality: 85,
        description: 'Desktop header profile (150x150)'
      },
      {
        name: 'mobile',
        width: 120,
        height: 120,
        quality: 80,
        description: 'Mobile header profile (120x120)'
      },
      {
        name: 'thumbnail',
        width: 64,
        height: 64,
        quality: 75,
        description: 'Thumbnail/favicon (64x64)'
      },
      {
        name: 'original-optimized',
        width: metadata.width,
        height: metadata.height,
        quality: 90,
        description: 'Original size WebP optimized'
      }
    ];

    const optimizedFiles = [];

    for (const opt of optimizations) {
      // Generate WebP version (best compression, modern browsers)
      const webpPath = path.join(distImagesDir, `profile-${opt.name}.webp`);
      const webpResult = await originalImage
        .resize(opt.width, opt.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: opt.quality,
          effort: 6, // High compression effort
          nearLossless: false
        })
        .toFile(webpPath);

      // Generate JPEG fallback (universal compatibility)
      const jpegPath = path.join(distImagesDir, `profile-${opt.name}.jpg`);
      const jpegResult = await originalImage
        .resize(opt.width, opt.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: opt.quality,
          progressive: true,
          mozjpeg: true
        })
        .toFile(jpegPath);

      optimizedFiles.push({
        name: opt.name,
        description: opt.description,
        webp: {
          path: webpPath,
          size: Math.round(webpResult.size / 1024),
          dimensions: `${webpResult.width}x${webpResult.height}`
        },
        jpeg: {
          path: jpegPath,
          size: Math.round(jpegResult.size / 1024),
          dimensions: `${jpegResult.width}x${jpegResult.height}`
        }
      });

      console.log(`✅ ${opt.description}:`);
      console.log(`   📦 WebP: ${Math.round(webpResult.size / 1024)}KB (${webpResult.width}x${webpResult.height})`);
      console.log(`   📦 JPEG: ${Math.round(jpegResult.size / 1024)}KB (${jpegResult.width}x${jpegResult.height})`);
    }

    // Calculate total size savings
    const originalSize = Math.round(metadata.size / 1024);
    const optimizedSizes = optimizedFiles.map(f => f.webp.size + f.jpeg.size);
    const totalOptimizedSize = optimizedSizes.reduce((sum, size) => sum + size, 0);
    const sizeSaving = Math.round(((originalSize - (optimizedFiles[0].webp.size)) / originalSize) * 100);

    console.log(`🎯 Optimization Results:`);
    console.log(`   📊 Original: ${originalSize}KB`);
    console.log(`   📊 Desktop WebP: ${optimizedFiles[0].webp.size}KB (${sizeSaving}% smaller)`);
    console.log(`   📊 Total generated: ${optimizedFiles.length * 2} files (${totalOptimizedSize}KB)`);
    console.log(`   🚀 Primary profile loads ${sizeSaving}% faster!`);

    return {
      optimized: true,
      files: optimizedFiles,
      savings: sizeSaving,
      originalSize: originalSize,
      primaryWebP: `assets/images/profile-desktop.webp`,
      primaryJPEG: `assets/images/profile-desktop.jpg`
    };

  } catch (error) {
    console.error('❌ Profile image optimization failed:', error);
    return null;
  }
}

// Generate HTML from template and data
async function generateHTML(resumeData, templatePath, options = {}) {
  const isDraft = options.mode === 'draft' || process.env.BUILD_MODE === 'draft';
  console.log(`📝 Generating HTML from template... ${isDraft ? '(draft mode)' : ''}`);

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

  // Always copy assets (fast operation)
  copyAssets(resumeData);

  // Optimize profile image for web performance (new feature!)
  let profileImageOptimization = null;
  if (resumeData.basics.image && !isDraft) {
    profileImageOptimization = await optimizeProfileImage(resumeData.basics.image, resumeData);
  }

  // Skip QR code generation in draft mode (expensive operation)
  let qrCodeDataURL = null;
  if (!isDraft) {
    qrCodeDataURL = await generateQRCode(resumeData.basics.url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } else {
    console.log('⚡ Draft mode: Skipping QR code generation');
    // Use placeholder for draft mode
    qrCodeDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+RFJBRlQgTU9ERTwvdGV4dD48L3N2Zz4=';
  }

  // Enhance resume data with optimized images
  const enhancedResumeData = {
    ...resumeData,
    profileImageOptimization
  };

  // Replace the placeholder QR code with the real one
  let html = template(enhancedResumeData);
  if (qrCodeDataURL) {
    html = html.replace(
      /src="data:image\/png;base64,[^"]*"/,
      `src="${qrCodeDataURL}"`
    );
    console.log('✅ QR code integrated successfully!');
  }

  // Update app version, environment and commit hash from package.json and CI environment
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const appVersion = packageJson.version;
  const buildBranch = process.env.GITHUB_REF_NAME || process.env.BRANCH || 'main';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.GITHUB_REF_NAME === 'main' || process.env.GITHUB_ACTIONS;
  const environment = isProduction && buildBranch === 'main' ? 'production' : 'preview';
  const commitHash = process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'dev-local';
  const commitShort = commitHash !== 'dev-local' ? commitHash.substring(0, 7) : 'dev-local';
  const buildTimestamp = new Date().toISOString();

  // Replace version placeholders in HTML
  html = html.replace(/const appVersion = '[^']*';/, `const appVersion = '${appVersion}';`);
  html = html.replace(/const branchName = isProduction \? 'main' : 'preview';/,
    `const branchName = '${buildBranch}';`);
  html = html.replace(/const commitHash = '[^']*';/, `const commitHash = '${commitShort}';`);
  html = html.replace(/const buildTimestamp = '[^']*';/, `const buildTimestamp = '${buildTimestamp}';`);
  html = html.replace(/<span id="app-version">[\d.]+<\/span>/,
    `<span id="app-version">${appVersion}</span>`);
  html = html.replace(/<span id="app-environment">[^<]*<\/span>/,
    `<span id="app-environment">${environment}</span>`);
  html = html.replace(/<span id="app-commit">[^<]*<\/span>/,
    `<span id="app-commit">${commitShort}</span>`);

  // Update meta tags with build information
  html = html.replace(/(<meta name="build-commit" content=")[^"]*(")/,
    `$1${commitShort}$2`);
  html = html.replace(/(<meta name="build-timestamp" content=")[^"]*(")/,
    `$1${buildTimestamp}$2`);
  html = html.replace(/(<meta name="app-version" content=")[^"]*(")/,
    `$1${appVersion}$2`);

  // Inject livereload script for development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || isDraft;
  if (isDevelopment) {
    const livereloadScript = `
    <script>
      document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')
    </script>`;
    html = html.replace('</body>', `${livereloadScript}\n</body>`);
    console.log('🔥 LiveReload script injected for hot reload');
  }

  console.log(`🔖 App version: ${appVersion} (${environment} on ${buildBranch})`);
  console.log(`📝 Build info: ${commitShort} at ${buildTimestamp}`);

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

// Main build function with mode support
async function build(options = {}) {
  const mode = options.mode || process.env.BUILD_MODE || 'production';
  const isDraft = mode === 'draft';
  const isProduction = mode === 'production';

  console.log(`🏗️  Starting ${isDraft ? 'DRAFT' : 'PRODUCTION'} build...`);

  const resumeData = JSON.parse(fs.readFileSync('./resume-data.json', 'utf8'));

  // Always run core build steps
  await generateHTML(resumeData, './templates/template.html', { mode });

  // Skip expensive operations in draft mode
  if (isDraft) {
    console.log('⚡ Draft mode: Skipping PDF generation and QR code creation');
    console.log('🎉 Draft build complete! (HTML only)');
    console.log('🌐 Preview: ./dist/index.html');
    return;
  }

  // Production mode: Generate PDFs with timeout
  if (isProduction) {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF generation timeout (60s)')), 60000)
      );

      await Promise.race([generatePDF(resumeData), timeout]);
    } catch (error) {
      console.error('⚠️  PDF generation failed or timed out:', error.message);
      console.log('✅ HTML generation completed - continuing without PDF');
    }
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

// Allow script to be called directly (for CLI usage) or imported as module
if (require.main === module) {
  build().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  build,
  generateHTML,
  generatePDF,
  copyAssets
};
