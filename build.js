const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

console.log('🏗️  Building resume...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Generate HTML from template and data
function generateHTML() {
  console.log('📝 Generating HTML from template...');
  
  const resumeData = JSON.parse(fs.readFileSync('./resume-data.json', 'utf8'));
  const templateSource = fs.readFileSync('./template.html', 'utf8');
  const template = Handlebars.compile(templateSource);
  
  // Register a helper to stringify JSON
  Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
  });

  // Copy profile image if it exists
  if (resumeData.basics.image && fs.existsSync(resumeData.basics.image)) {
    const imagePath = resumeData.basics.image;
    fs.copyFileSync(imagePath, `./dist/${path.basename(imagePath)}`);
    console.log(`📸 Copied profile image: ${imagePath}`);
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
  generateHTML();
  await generatePDF();
  console.log('🎉 Resume build complete!');
  console.log('📁 Files generated in ./dist/');
  console.log('🌐 HTML: ./dist/index.html');
  console.log('📄 PDF: ./dist/resume.pdf');
}

build().catch(console.error);