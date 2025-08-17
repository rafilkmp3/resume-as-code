const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const { copyRecursive } = require('./utils/fs-utils');
// Use proper Sharp-based optimization with WebP + JPEG support
const { optimizeProfileImageForResume } = require('./utils/image-optimization');

// Check for validation-only mode
const isValidationOnly = process.argv.includes('--validate-only');

if (isValidationOnly) {
  console.log('🔍 Validation mode: Checking template and data integrity...');
} else {
  console.log('🏗️  Building resume...');
}

// Ensure dist directory exists (unless validation-only)
if (!isValidationOnly && !fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Get the appropriate URL for QR code generation based on environment
function getQRCodeURL() {
  try {
    // Debug: Log all relevant environment variables for troubleshooting
    console.log('🔍 Environment Debug Info:');
    console.log('  NETLIFY:', process.env.NETLIFY || 'false');
    console.log('  REVIEW_ID:', process.env.REVIEW_ID || process.env.PR_NUMBER || 'none');
    console.log('  HEAD:', process.env.HEAD || process.env.HEAD_REF || process.env.GITHUB_HEAD_REF || 'main');
    console.log('  BRANCH:', process.env.BRANCH || process.env.HEAD_REF || process.env.GITHUB_HEAD_REF || 'main');
    console.log('  CONTEXT:', process.env.CONTEXT || (process.env.NETLIFY ? 'deploy-preview' : 'local'));
    console.log('  DEPLOY_URL:', process.env.DEPLOY_URL || 'none');
    console.log('  URL:', process.env.URL || 'none');
    console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('  GITHUB_PAGES:', process.env.GITHUB_PAGES || 'false');

    // Netlify environment (check first as it has highest priority for previews)
    // Since we build in GitHub Actions, we set DEPLOY_URL directly
    if (process.env.NETLIFY === 'true' || process.env.NETLIFY_ENV) {
      // Use GitHub Actions-provided DEPLOY_URL
      if (process.env.DEPLOY_URL) {
        console.log('🌐 Using GitHub Actions DEPLOY_URL:', process.env.DEPLOY_URL);
        return process.env.DEPLOY_URL;
      }

      // Check for deploy preview context
      if (process.env.CONTEXT === 'deploy-preview') {
        const prNumber = process.env.REVIEW_ID;
        if (prNumber) {
          const url = `https://deploy-preview-${prNumber}--resume-as-code.netlify.app`;
          console.log('🌐 Using PR preview URL:', url);
          return url;
        }
      }

      // Check for branch deploy context
      if (process.env.CONTEXT === 'branch-deploy') {
        const branchName = process.env.HEAD || process.env.BRANCH;
        if (branchName && branchName !== 'main') {
          const url = `https://${branchName}--resume-as-code.netlify.app`;
          console.log('🌐 Using branch deploy URL:', url);
          return url;
        }
      }

      // Netlify production
      const url = 'https://resume-as-code.netlify.app';
      console.log('🌐 Using Netlify production URL:', url);
      return url;
    }

    // Production environment (GitHub Pages) - only if not on Netlify
    if (process.env.GITHUB_PAGES === 'true' || process.env.NODE_ENV === 'production') {
      const url = 'https://rafilkmp3.github.io/resume-as-code/';
      console.log('🌐 Using GitHub Pages URL:', url);
      return url;
    }

    // Development environment - try to get LAN IP for mobile access
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
      for (const interface of interfaces || []) {
        if (interface.family === 'IPv4' && !interface.internal) {
          console.log(`🌐 Detected LAN IP: ${interface.address} (interface: ${name})`);
          return `http://${interface.address}:3000`;
        }
      }
    }

    // Fallback to localhost for development
    return 'http://localhost:3000';
  } catch (error) {
    console.error('Error getting QR code URL:', error);
    return 'http://localhost:3000';
  }

}

// Legacy function for backward compatibility
function getMacLanIP() {
  const url = getQRCodeURL();
  if (url.startsWith('http://')) {
    const match = url.match(/http:\/\/([^:]+):/);
    return match ? match[1] : null;
  }
  return null;
}

// QR codes are now generated dynamically in the browser for better performance
// This eliminates the need for server-side QR generation and reduces HTML size

// DRY Profile Image Optimization using utility
async function optimizeProfileImage(imagePath, resumeData, options = {}) {
  try {
    return await optimizeProfileImageForResume(imagePath, {
      isDraft: options.mode === 'draft' || process.env.BUILD_MODE === 'draft',
      outputDir: './dist/assets/images'
    });
  } catch (error) {
    console.error('❌ Image optimization failed, continuing build without optimization:', error.message);
    console.log('💡 Build will continue with original image file');
    return null; // Return null so template uses fallback image
  }
}

// Generate optimized QR code image files for reliable PDF embedding (like optimized images)
async function generateQRCodeImages(url) {
  try {
    const QRCode = require('qrcode');
    const fs = require('fs');
    const sharp = require('sharp');
    
    // Ensure assets/images directory exists
    const imagesDir = './dist/assets/images';
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const results = {};
    const qrConfigs = [
      { name: 'modal', size: 120, filename: 'qr-code-modal.png' },
      { name: 'print', size: 80, filename: 'qr-code-print.png' }
    ];

    for (const config of qrConfigs) {
      // Generate QR code as buffer (high quality)
      const qrBuffer = await QRCode.toBuffer(url, {
        width: config.size,
        height: config.size,
        margin: 1,
        color: {
          dark: '#2563eb',
          light: '#FFFFFF'
        },
        type: 'png'
      });

      // Generate optimized PNG (PNG is more efficient for QR codes than WebP)
      const pngPath = path.join(imagesDir, config.filename);
      const pngOutput = await sharp(qrBuffer)
        .png({ 
          quality: 90,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true  // Use palette mode for better compression on simple images
        })
        .toFile(pngPath);

      const pngSizeKB = Math.round(pngOutput.size / 1024 * 10) / 10;
      console.log(`   ✅ ${config.name} QR: ${pngSizeKB}KB PNG (${config.size}x${config.size}) - optimized for QR patterns`);
      
      results[`${config.name}Path`] = `assets/images/${config.filename}`;
    }

    console.log(`✅ Optimized QR codes generated for: ${url}`);
    
    return results;
  } catch (error) {
    console.warn('❌ QR code generation failed:', error.message);
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

  // Optimize profile image for web performance (new DRY approach!)
  let profileImageOptimization = null;
  if (resumeData.basics.image) {
    profileImageOptimization = await optimizeProfileImage(resumeData.basics.image, resumeData, { isDraft });
    // Update resume data to use optimized mobile image for main display
    resumeData.basics.image = 'assets/images/profile-mobile.jpg';
  }

  // Generate QR codes at build time for reliable PDF embedding
  const qrCodeUrl = getQRCodeURL();
  console.log(`📱 QR Code URL: ${qrCodeUrl}`);
  
  let qrCodeImages = null;
  if (!isDraft) {
    console.log('🔗 Generating QR code images for reliable PDF embedding...');
    qrCodeImages = await generateQRCodeImages(qrCodeUrl);
  }

  // Enhance resume data with optimized images and QR code image paths
  const enhancedResumeData = {
    ...resumeData,
    profileImageOptimization,
    qrCodeUrl: qrCodeUrl,
    qrCodeModalImage: qrCodeImages?.modalPath || null,
    qrCodePrintImage: qrCodeImages?.printPath || null
  };

  // Generate HTML (QR codes will be generated dynamically in browser)
  let html = template(enhancedResumeData);
  console.log('✅ Template generated successfully with dynamic QR code support!');

  // Enhanced environment detection for smart preview configuration
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const appVersion = process.env.APP_VERSION || packageJson.version;
  const buildBranch = process.env.GITHUB_REF_NAME || process.env.HEAD || process.env.BRANCH || 'main';

  // Smart environment detection
  const isNetlifyPreview = process.env.NETLIFY === 'true' && process.env.CONTEXT === 'deploy-preview';
  const isNetlifyBranch = process.env.NETLIFY === 'true' && process.env.CONTEXT === 'branch-deploy';
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isProduction = (buildBranch === 'main' && !isNetlifyPreview) || process.env.NODE_ENV === 'production';

  // Environment classification with detailed context
  let environment, environmentDetails;
  if (isNetlifyPreview) {
    environment = 'netlify-preview';
    environmentDetails = `Netlify PR Preview (#${process.env.REVIEW_ID || 'unknown'})`;
  } else if (isNetlifyBranch) {
    environment = 'netlify-branch';
    environmentDetails = `Netlify Branch Deploy (${buildBranch})`;
  } else if (isGitHubPages && buildBranch === 'main') {
    environment = 'production';
    environmentDetails = 'GitHub Pages Production';
  } else if (isGitHubPages) {
    environment = 'github-preview';
    environmentDetails = `GitHub Actions Build (${buildBranch})`;
  } else {
    environment = 'development';
    environmentDetails = 'Local Development';
  }

  const commitHash = process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'dev-local';
  const commitShort = commitHash !== 'dev-local' ? commitHash.substring(0, 7) : 'dev-local';
  const commitsSinceRelease = process.env.COMMITS_SINCE_RELEASE || '0';
  const lastReleaseTag = process.env.LAST_RELEASE_TAG || 'none';
  const buildTimestamp = new Date().toISOString();

  // PR-specific information for preview environments
  const prNumber = process.env.REVIEW_ID || process.env.PR_NUMBER || '';
  const deployUrl = process.env.DEPLOY_URL || qrCodeUrl;

  console.log('📊 Enhanced Version Information:');
  console.log(`  App Version: ${appVersion}`);
  console.log(`  Environment: ${environment} (${environmentDetails})`);
  console.log(`  Build Branch: ${buildBranch}`);
  console.log(`  Deploy URL: ${deployUrl}`);
  console.log(`  Commit: ${commitShort}`);
  console.log(`  Commits since release: ${commitsSinceRelease}`);
  console.log(`  Last release tag: ${lastReleaseTag}`);
  if (prNumber) {
    console.log(`  PR Number: #${prNumber}`);
  }

  // Replace version placeholders in HTML
  html = html.replace(/const appVersion = '[^']*';/, `const appVersion = '${appVersion}';`);
  html = html.replace(/const branchName = isProduction \? 'main' : 'preview';/,
    `const branchName = '${buildBranch}';`);
  // Enhanced environment variable replacements for smart contextual linking
  const buildContext = process.env.BUILD_CONTEXT || 'main';
  const contextUrl = process.env.CONTEXT_URL || '';
  const compareUrl = process.env.COMPARE_URL || '';

  console.log('🔗 Contextual linking information:');
  console.log(`  Build context: ${buildContext}`);
  console.log(`  PR number: ${prNumber}`);
  console.log(`  Context URL: ${contextUrl}`);
  console.log(`  Compare URL: ${compareUrl}`);

  html = html.replace(/const commitHash = '[^']*';/, `const commitHash = '${commitShort}';`);
  html = html.replace(/const buildTimestamp = '[^']*';/, `const buildTimestamp = '${buildTimestamp}';`);
  html = html.replace(/const commitsSinceRelease = '\d+';/, `const commitsSinceRelease = '${commitsSinceRelease}';`);
  html = html.replace(/const buildContext = '[^']*';/, `const buildContext = '${buildContext}';`);
  html = html.replace(/const prNumber = '[^']*';/, `const prNumber = '${prNumber}';`);
  html = html.replace(/const contextUrl = '[^']*';/, `const contextUrl = '${contextUrl}';`);
  html = html.replace(/const compareUrl = '[^']*';/, `const compareUrl = '${compareUrl}';`);
  html = html.replace(/<span id="app-version">[\d.]+<\/span>/,
    `<span id="app-version">${appVersion}</span>`);
  html = html.replace(/<span id="app-environment">[^<]*<\/span>/,
    `<span id="app-environment">${environment}</span>`);
  html = html.replace(/<span id="app-commit">[^<]*<\/span>/,
    `<span id="app-commit">${commitShort}</span>`);
  html = html.replace(/<span id="commits-since-release">[^<]*<\/span>/,
    `<span id="commits-since-release">${commitsSinceRelease}</span>`);

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

    // Netlify/CI-specific Puppeteer configuration
    const isNetlify = process.env.NETLIFY === 'true';
    const isCI = process.env.CI === 'true';

    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
      ]
    };

    // Use system Chrome on Netlify
    if (isNetlify && process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    console.log(`🌍 Environment: ${isNetlify ? 'Netlify' : (isCI ? 'CI' : 'Local')}`);

    const browser = await puppeteer.launch(launchOptions);

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

  // Wait for any QR codes to load from pre-generated base64 data
  await page.waitForSelector('#print-qr-code', { timeout: 2000 }).catch(() => {
    console.log('ℹ️  QR code element not found, continuing PDF generation');
  });

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

  // Suppress all console output during PDF generation to prevent text appearing in PDF
  await page.evaluateOnNewDocument(() => {
    const originalConsole = window.console;
    window.console = {
      ...originalConsole,
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {}
    };
  });

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

      /* Aggressively reduce spacing to minimize pages */
      .main-content {
        padding: 0.5rem !important;
        gap: 0.25rem !important;
        min-height: auto !important;
      }

      .section {
        margin-bottom: 0.5rem !important;
        page-break-inside: auto !important; /* Allow breaking for compactness */
      }

      .container {
        min-height: auto !important;
        padding: 0 !important;
      }

      /* Ultra-compact sections */
      .left-column, .right-column {
        gap: 0.25rem !important;
      }

      .work-item, .project-item, .education-item {
        margin-bottom: 0.5rem !important;
        padding: 0.25rem !important;
      }

      /* Compact text and reduce line heights */
      h1, h2, h3, h4, h5, h6 {
        margin: 0.25rem 0 !important;
        line-height: 1.1 !important;
      }

      p, li {
        margin: 0.125rem 0 !important;
        line-height: 1.2 !important;
      }

      /* Hide web-only elements to save space */
      .pdf-dropdown-wrapper, .pdf-dropdown-menu, .action-buttons,
      .qr-modal, .no-print, .dark-toggle, .load-more-container,
      .load-more-btn, .experience-counter, .experience-controls,
      .skills-counter, .education-counter { display: none !important; }

      /* Show QR code section for Screen PDF */
      .print-qr-section {
        display: block !important;
        text-align: center !important;
        margin-top: 1rem !important;
        padding: 0.5rem !important;
        page-break-inside: avoid !important;
      }
      .print-qr-code {
        width: 80px !important;
        height: 80px !important;
        margin: 0 auto !important;
        display: block !important;
      }

      /* Ensure profile photo is visible and properly sized */
      .profile-photo {
        display: block !important;
        width: 120px !important;
        height: 120px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        margin: 0 auto 0.5rem !important;
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
    margin: { top: '2mm', bottom: '2mm', left: '2mm', right: '2mm' },
    scale: 0.98,
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

  // Wait for any QR codes to load from pre-generated base64 data
  await page.waitForSelector('#print-qr-code', { timeout: 2000 }).catch(() => {
    console.log('ℹ️  QR code element not found, continuing PDF generation');
  });

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
          font-size: 10pt !important;
          line-height: 1.2 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          -webkit-print-color-adjust: exact !important;
          color: white !important;
          print-color-adjust: exact !important;
        }
        .section-title, h2 {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin-top: 10pt !important;
          margin-bottom: 6pt !important;
          color: #2c3e50 !important;
        }
        .experience-item, .project-item, .education-item {
          margin-bottom: 4pt !important;
          page-break-inside: avoid !important; /* Prevent breaking experience entries */
        }
        .work-header {
          page-break-after: avoid !important; /* Keep headers with content */
        }
        .contact-info {
          font-size: 10pt !important;
        }
        /* Enhanced contrast for printing */
        p, li, span { color: #000 !important; }
        .subtitle { font-size: 12pt !important; }

        /* Hide web-only elements but keep profile photo */
        .pdf-dropdown-wrapper, .pdf-dropdown-menu, .action-buttons,
        .qr-modal, .no-print, .dark-toggle, .load-more-container,
        .load-more-btn, .experience-counter, .experience-controls,
        .skills-counter, .education-counter { display: none !important; }

        /* Ensure profile photo is visible and properly sized for print */
        .profile-photo {
          display: block !important;
          width: 100px !important;
          height: 100px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          margin: 0 auto 0.5rem !important;
        }
        /* Professional page break rules */
        .section {
          page-break-inside: avoid !important;
        }
        .work-item:last-child {
          page-break-after: auto !important;
        }
        /* QR code optimization for print */
        .print-qr-section {
          display: block !important;
          text-align: center !important;
          margin-top: 1rem !important;
          padding: 0.5rem !important;
          page-break-inside: avoid !important;
        }
        .print-qr-code {
          width: 80px !important;
          height: 80px !important;
          margin: 0 auto !important;
          display: block !important;
        }
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
    margin: { top: '6mm', bottom: '6mm', left: '8mm', right: '8mm' },
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
          font-size: 9pt !important;
          line-height: 1.1 !important;
          margin: 6pt !important;
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
          margin: 1pt 0 !important;
          page-break-inside: auto !important; /* Allow breaking for maximum compactness */
          page-break-before: auto !important;
          page-break-after: auto !important;
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

        /* Hide visual elements for ATS (profile photo hidden only in ATS) */
        .profile-photo, .parallax-bg, .dark-toggle, .controls, .links,
        .fade-in-section::before, .gradient-text, .print-only,
        .print-qr-section, .pdf-download-group, .pdf-dropdown-wrapper,
        .pdf-dropdown-menu, .action-buttons, .qr-modal, .no-print { display: none !important; }

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
    margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
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

  // Step 1: Build template from components
  console.log('🧩 Building template from components...');
  const { exec } = require('child_process');
  await new Promise((resolve, reject) => {
    exec('npm run template:build', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Template build failed:', error.message);
        reject(error);
      } else {
        console.log(stdout);
        // Activate the new template
        if (fs.existsSync('template.html.new')) {
          fs.renameSync('template.html.new', 'src/templates/template.html');
          console.log('✅ Component-based template activated');
        }
        resolve();
      }
    });
  });

  const resumeData = JSON.parse(fs.readFileSync('./src/resume-data.json', 'utf8'));

  // Always run core build steps
  await generateHTML(resumeData, './src/templates/template.html', { mode });

  // Skip expensive PDF operations in draft mode (but keep QR code)
  if (isDraft) {
    console.log('⚡ Draft mode: Skipping PDF generation');
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
