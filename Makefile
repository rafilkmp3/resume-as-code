.PHONY: help build dev serve clean install pdf html kill-port status watch live

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m 
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
NC=\033[0m # No Color

# Default target
help:
	@echo "📋 Available commands:"
	@echo "  $(CYAN)make install$(NC)    - Install dependencies"
	@echo "  $(GREEN)make build$(NC)      - Build HTML and PDF"
	@echo "  $(BLUE)make html$(NC)       - Generate HTML only"
	@echo "  $(BLUE)make pdf$(NC)        - Generate PDF only"
	@echo "  $(PURPLE)make dev$(NC)        - Kill port, build and serve on localhost:3000"
	@echo "  $(PURPLE)make serve$(NC)      - Serve existing build on localhost:3000"
	@echo "  $(PURPLE)make live$(NC)       - Live development with file watching"
	@echo "  $(YELLOW)make kill-port$(NC)  - Kill any process running on port 3000"
	@echo "  $(RED)make clean$(NC)      - Clean dist directory"
	@echo "  $(CYAN)make watch$(NC)      - Watch for changes and rebuild"
	@echo "  $(CYAN)make status$(NC)     - Show project status and file info"

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

# Kill any process running on port 3000
kill-port:
	@echo "$(YELLOW)🔍 Checking for processes on port 3000...$(NC)"
	@if lsof -ti:3000 >/dev/null 2>&1; then \
		echo "$(RED)💀 Killing process on port 3000...$(NC)"; \
		kill -9 $$(lsof -ti:3000) 2>/dev/null || true; \
		sleep 1; \
		echo "$(GREEN)✅ Port 3000 is now free$(NC)"; \
	else \
		echo "$(GREEN)✅ Port 3000 is already free$(NC)"; \
	fi

# Build and serve (development mode)
dev: kill-port build
	@echo "$(PURPLE)🚀 Starting development server...$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(CYAN)📄 PDF available at: http://localhost:3000/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	npm run serve

# Serve existing build
serve: kill-port
	@echo "$(PURPLE)🌐 Starting server...$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(CYAN)📄 PDF available at: http://localhost:3000/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	npm run serve

# Live development with file watching
live: kill-port
	@echo "$(PURPLE)🔥 Starting live development mode...$(NC)"
	@echo "$(CYAN)👀 Watching: resume-data.json, template.html$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@trap 'kill %1 2>/dev/null || true; exit' INT; \
	make build && npm run serve & \
	while true; do \
		if command -v fswatch >/dev/null 2>&1; then \
			fswatch -o resume-data.json template.html | while read; do make build; done; \
		elif command -v inotifywait >/dev/null 2>&1; then \
			inotifywait -e modify resume-data.json template.html 2>/dev/null && make build; \
		else \
			echo "$(YELLOW)⚠️  No file watcher found (fswatch/inotifywait), using polling...$(NC)"; \
			sleep 3; \
			make build; \
		fi; \
	done

# Watch for changes and rebuild (without server)
watch:
	@echo "$(CYAN)👀 Watching for changes...$(NC)"
	@echo "$(CYAN)📁 Watching: resume-data.json, template.html$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	@while true; do \
		if command -v fswatch >/dev/null 2>&1; then \
			fswatch -o resume-data.json template.html | while read; do \
				echo "$(GREEN)🔄 File changed, rebuilding...$(NC)"; \
				make build; \
				echo "$(GREEN)✅ Rebuilt at $$(date)$(NC)"; \
			done; \
		elif command -v inotifywait >/dev/null 2>&1; then \
			inotifywait -e modify resume-data.json template.html 2>/dev/null; \
			echo "$(GREEN)🔄 File changed, rebuilding...$(NC)"; \
			make build; \
			echo "$(GREEN)✅ Rebuilt at $$(date)$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  No file watcher found (fswatch/inotifywait), using polling...$(NC)"; \
			sleep 3; \
			make build; \
		fi; \
	done

# Clean dist directory
clean:
	@echo "$(RED)🧹 Cleaning dist directory...$(NC)"
	rm -rf dist/
	@echo "$(GREEN)✅ Clean complete$(NC)"

# Comprehensive status check
status:
	@echo "$(CYAN)📊 Resume Project Status$(NC)"
	@echo "$(CYAN)========================$(NC)"
	@if [ -f "dist/index.html" ]; then \
		SIZE=$$(ls -lh dist/index.html | awk '{print $$5}'); \
		echo "$(GREEN)✅ HTML: dist/index.html ($$SIZE)$(NC)"; \
	else \
		echo "$(RED)❌ HTML: Missing$(NC)"; \
	fi
	@if [ -f "dist/resume.pdf" ]; then \
		SIZE=$$(ls -lh dist/resume.pdf | awk '{print $$5}'); \
		echo "$(GREEN)✅ PDF: dist/resume.pdf ($$SIZE)$(NC)"; \
	else \
		echo "$(RED)❌ PDF: Missing$(NC)"; \
	fi
	@if [ -f "resume-data.json" ]; then \
		echo "$(GREEN)✅ Data: resume-data.json$(NC)"; \
	else \
		echo "$(RED)❌ Data: Missing$(NC)"; \
	fi
	@if [ -f "template.html" ]; then \
		echo "$(GREEN)✅ Template: template.html$(NC)"; \
	else \
		echo "$(RED)❌ Template: Missing$(NC)"; \
	fi
	@if [ -f "eu-no-foguete-perfil.jpeg" ]; then \
		SIZE=$$(ls -lh eu-no-foguete-perfil.jpeg | awk '{print $$5}'); \
		echo "$(GREEN)✅ Profile Image: eu-no-foguete-perfil.jpeg ($$SIZE)$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Profile Image: Missing$(NC)"; \
	fi
	@echo "$(CYAN)========================$(NC)"
	@if lsof -ti:3000 >/dev/null 2>&1; then \
		PID=$$(lsof -ti:3000); \
		echo "$(YELLOW)🟡 Port 3000: Occupied (PID: $$PID)$(NC)"; \
	else \
		echo "$(GREEN)✅ Port 3000: Available$(NC)"; \
	fi
	@if command -v node >/dev/null 2>&1; then \
		VERSION=$$(node --version); \
		echo "$(GREEN)✅ Node.js: $$VERSION$(NC)"; \
	else \
		echo "$(RED)❌ Node.js: Not installed$(NC)"; \
	fi