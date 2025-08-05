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
    if (fs.existsSync('./dist/index.html')) {
      console.log('📄 Generating PDF from HTML...');
      console.log('⏱️  PDF generation timeout: 60 seconds');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-running-insecure-content']
      });
      
      const page = await browser.newPage();
      
      // Set a larger viewport to ensure proper rendering
      await page.setViewport({ width: 1200, height: 1600 });
      
      // Navigate to the file using file:// protocol to ensure resources load
      const filePath = path.resolve('./dist/index.html');
      await page.goto(`file://${filePath}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for images to load
      await page.waitForSelector('img', { timeout: 5000 }).catch(() => {
        console.log('⚠️  No images found or timeout waiting for images');
      });
      
      // Add a small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Emulate print media before PDF generation
      await page.emulateMediaType('print');
      
      await page.pdf({
        path: './dist/resume.pdf',
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true, // Let CSS @page control margins completely
        displayHeaderFooter: false,
        margin: {
          top: '0',
          bottom: '0', 
          left: '0',
          right: '0'
        },
        scale: 0.95, // Slight scale down for better fit and margins
        tagged: true, // Generate tagged PDF for accessibility
        // Professional PDF metadata
        title: `${resumeData.basics.name} - Resume`,
        author: resumeData.basics.name,
        subject: resumeData.basics.label,
        keywords: (resumeData.basics.keywords || []).join(', '),
        creator: 'Resume-as-Code System',
        producer: 'Puppeteer PDF Generator'
      });

      await browser.close();
      console.log('✅ PDF generated successfully!');
    }
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.log('⚠️  Continuing without PDF...');
  }
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
  
  // Only mention PDF if it exists
  if (fs.existsSync('./dist/resume.pdf')) {
    console.log('📄 PDF: ./dist/resume.pdf');
  } else {
    console.log('📄 PDF: Not generated (HTML-only build)');
  }
}

build().catch(console.error);
