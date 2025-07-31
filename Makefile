.PHONY: help build dev serve clean install pdf html

# Default target
help:
	@echo "📋 Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make build    - Build HTML and PDF"
	@echo "  make html     - Generate HTML only"
	@echo "  make pdf      - Generate PDF only"
	@echo "  make dev      - Build and serve on localhost:3000"
	@echo "  make serve    - Serve existing build on localhost:3000"
	@echo "  make clean    - Clean dist directory"
	@echo "  make watch    - Watch for changes and rebuild"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build everything
build:
	@echo "🏗️  Building resume..."
	npm run build

# Generate HTML only
html:
	@echo "📝 Generating HTML..."
	node -e "const fs = require('fs'); const path = require('path'); const Handlebars = require('handlebars'); if (!fs.existsSync('./dist')) { fs.mkdirSync('./dist'); } const resumeData = JSON.parse(fs.readFileSync('./resume-data.json', 'utf8')); if (resumeData.basics.image && fs.existsSync(resumeData.basics.image)) { fs.copyFileSync(resumeData.basics.image, \`./dist/\${path.basename(resumeData.basics.image)}\`); console.log('📸 Copied profile image'); } const templateSource = fs.readFileSync('./template.html', 'utf8'); const template = Handlebars.compile(templateSource); const html = template(resumeData); fs.writeFileSync('./dist/index.html', html); console.log('✅ HTML generated successfully!');"

# Generate PDF only (requires HTML to exist)
pdf: html
	@echo "📄 Generating PDF..."
	node -e "const puppeteer = require('puppeteer'); const fs = require('fs'); (async () => { const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] }); const page = await browser.newPage(); const html = fs.readFileSync('./dist/index.html', 'utf8'); await page.setContent(html, { waitUntil: 'networkidle0' }); await page.pdf({ path: './dist/resume.pdf', format: 'A4', printBackground: true, margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } }); await browser.close(); console.log('✅ PDF generated successfully!'); })();"

# Build and serve (development mode)
dev: build
	@echo "🚀 Starting development server..."
	@echo "📱 Resume available at: http://localhost:3000"
	@echo "📄 PDF available at: http://localhost:3000/resume.pdf"
	@echo "🛑 Press Ctrl+C to stop"
	npm run serve

# Serve existing build
serve:
	@echo "🌐 Starting server..."
	@echo "📱 Resume available at: http://localhost:3000"
	@echo "📄 PDF available at: http://localhost:3000/resume.pdf"
	@echo "🛑 Press Ctrl+C to stop"
	npm run serve

# Watch for changes and rebuild
watch:
	@echo "👀 Watching for changes..."
	@echo "📁 Watching: resume-data.json, template.html"
	@while true; do \
		inotifywait -e modify resume-data.json template.html 2>/dev/null || \
		(echo "⚠️  inotifywait not found, using basic polling..."; sleep 2); \
		make build; \
		echo "🔄 Rebuilt at $$(date)"; \
	done

# Clean dist directory
clean:
	@echo "🧹 Cleaning dist directory..."
	rm -rf dist/
	@echo "✅ Clean complete"

# Quick status check
status:
	@echo "📊 Resume Status:"
	@echo "=================="
	@if [ -f "dist/index.html" ]; then echo "✅ HTML: dist/index.html"; else echo "❌ HTML: Missing"; fi
	@if [ -f "dist/resume.pdf" ]; then echo "✅ PDF: dist/resume.pdf"; else echo "❌ PDF: Missing"; fi
	@if [ -f "resume-data.json" ]; then echo "✅ Data: resume-data.json"; else echo "❌ Data: Missing"; fi
	@if [ -f "template.html" ]; then echo "✅ Template: template.html"; else echo "❌ Template: Missing"; fi
	@echo "=================="