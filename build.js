const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');

console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Generate HTML from template and data
async function generateHTML() {
  console.log('📝 Generating HTML from template...');
  
  const resumeData = JSON.parse(fs.readFileSync('./resume-data.json', 'utf8'));
  const templateSource = fs.readFileSync('./template.html', 'utf8');
  const template = Handlebars.compile(templateSource);
  
  // Register a helper to stringify JSON
  Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
  });

  // Register a helper for equality comparison
  Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
  });

  // Generate QR code
  if (resumeData.basics.url) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(resumeData.basics.url, {
        errorCorrectionLevel: 'H',
        type: 'image/webp',
        quality: 0.9,
        margin: 1,
      });
      resumeData.basics.qrCode = qrCodeDataUrl;
      console.log('🔗 Generated QR code for live resume');
    } catch (err) {
      console.error('❌ Failed to generate QR code:', err);
    }
  }

  // Copy all profile images
  const profileDir = './images/profile';
  const distProfileDir = './dist/images/profile';
  
  if (fs.existsSync(profileDir)) {
    // Create profile directory in dist
    if (!fs.existsSync('./dist/images')) {
      fs.mkdirSync('./dist/images');
    }
    if (!fs.existsSync(distProfileDir)) {
      fs.mkdirSync(distProfileDir);
    }
    
    // Copy all profile images
    const profileFiles = fs.readdirSync(profileDir);
    profileFiles.forEach(file => {
      if (file.match(/\.(webp|jpg|jpeg|png)$/i)) {
        fs.copyFileSync(path.join(profileDir, file), path.join(distProfileDir, file));
        console.log(`📸 Copied profile image: ${file}`);
      }
    });
  }
  
  // Copy main profile image if it exists
  if (resumeData.basics.image && fs.existsSync(resumeData.basics.image)) {
    console.log(`📸 Profile image configured: ${resumeData.basics.image}`);
  }
  
  const html = template(resumeData);
  fs.writeFileSync('./dist/index.html', html);
  
  console.log('✅ HTML generated successfully!');
}

// Generate PDF from HTML
async function generatePDF() {
  try {
    if (fs.existsSync('./dist/index.html')) {
      console.log('📄 Generating PDF from HTML...');
      
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
        scale: 1.0
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
  generateHTML();
  await generatePDF();
  console.log('🎉 Resume build complete!');
  console.log('📁 Files generated in ./dist/');
  console.log('🌐 HTML: ./dist/index.html');
  console.log('📄 PDF: ./dist/resume.pdf');
}

build().catch(console.error);