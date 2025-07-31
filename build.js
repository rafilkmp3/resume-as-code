const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Generate PDF from HTML
async function generatePDF() {
  try {
    if (fs.existsSync('./dist/index.html')) {
      console.log('📄 Generating PDF from HTML...');
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      const html = fs.readFileSync('./dist/index.html', 'utf8');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: './dist/resume.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
          right: '0.5in'
        }
      });

      await browser.close();
      console.log('✅ PDF generated successfully!');
    }
  } catch (error) {
    console.log('⚠️  PDF generation failed, skipping...');
  }
}

// Run the build
async function build() {
  console.log('✅ HTML files ready in dist/');
  await generatePDF();
  console.log('🎉 Resume build complete!');
  console.log('📁 Files generated in ./dist/');
  console.log('🌐 HTML: ./dist/index.html');
  console.log('📄 PDF: ./dist/resume.pdf');
}

build().catch(console.error);