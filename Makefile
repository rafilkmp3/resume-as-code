.PHONY: help build dev serve clean install pdf html kill-port status watch live test test-quick test-visual test-a11y test-perf test-ci fix-layout lint-check

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
	@echo "  $(PURPLE)make dev$(NC)        - Hot reload development server on localhost:3000"
	@echo "  $(PURPLE)make serve$(NC)      - Serve existing build on localhost:3000"
	@echo "  $(PURPLE)make live$(NC)       - Live development with file watching"
	@echo "  $(YELLOW)make kill-port$(NC)  - Kill any process running on port 3000"
	@echo "  $(RED)make clean$(NC)      - Clean dist directory"
	@echo "  $(CYAN)make watch$(NC)      - Watch for changes and rebuild"
	@echo "  $(CYAN)make status$(NC)     - Show project status and file info"
	@echo ""
	@echo "🧪 Testing commands:"
	@echo "  $(GREEN)make test$(NC)       - Run all tests (visual, accessibility, performance)"
	@echo "  $(BLUE)make test-quick$(NC)  - Run quick tests only"
	@echo "  $(BLUE)make test-visual$(NC) - Run visual regression tests"
	@echo "  $(BLUE)make test-a11y$(NC)   - Run accessibility tests"
	@echo "  $(BLUE)make test-perf$(NC)   - Run performance tests"
	@echo "  $(CYAN)make test-ci$(NC)     - Run all tests for CI (with retries)"
	@echo "  $(YELLOW)make fix-layout$(NC)  - Auto-fix mobile layout issues"
	@echo "  $(PURPLE)make screenshots$(NC) - Generate documentation screenshots"

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

# Build and serve (development mode with hot reload)
dev: kill-port
	@echo "$(PURPLE)🚀 Starting development server with hot reload...$(NC)"
	@echo "$(CYAN)👀 Watching: resume-data.json, template.html$(NC)"
	@echo "$(CYAN)📱 Resume available at: http://localhost:3000$(NC)"
	@echo "$(CYAN)📄 PDF available at: http://localhost:3000/resume.pdf$(NC)"
	@echo "$(YELLOW)🛑 Press Ctrl+C to stop$(NC)"
	npm run dev

# Build and serve (old behavior - no hot reload)
dev\:old: kill-port build
	@echo "$(PURPLE)🌐 Starting server (no hot reload)...$(NC)"
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

# Mobile layout auto-fix
fix-layout:
	@echo "$(YELLOW)🔧 Running mobile layout auto-fix...$(NC)"
	node scripts/auto-fix-layout.js
	@echo "$(GREEN)✅ Layout fixes completed$(NC)"

# Quick tests (essential only)
test-quick: build
	@echo "$(BLUE)🧪 Running quick tests...$(NC)"
	npx playwright test tests/e2e/issue-detection.spec.js --project=chromium
	@echo "$(GREEN)✅ Quick tests completed$(NC)"

# Visual regression tests  
test-visual: build
	@echo "$(BLUE)📸 Running visual regression tests...$(NC)"
	npx playwright test tests/visual/comprehensive-visual.spec.js
	@echo "$(GREEN)✅ Visual tests completed$(NC)"

# Accessibility tests
test-a11y: build
	@echo "$(BLUE)♿ Running accessibility tests...$(NC)"
	npx playwright test tests/accessibility/a11y.spec.js
	@echo "$(GREEN)✅ Accessibility tests completed$(NC)"

# Performance tests
test-perf: build
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	npx playwright test tests/performance/perf.spec.js
	@echo "$(GREEN)✅ Performance tests completed$(NC)"

# Full test suite
test: build
	@echo "$(GREEN)🚀 Running complete test suite...$(NC)"
	@echo "$(CYAN)Running visual regression tests...$(NC)"
	npx playwright test tests/visual/
	@echo "$(CYAN)Running e2e tests...$(NC)"
	npx playwright test tests/e2e/
	@echo "$(CYAN)Running accessibility tests...$(NC)"
	npx playwright test tests/accessibility/
	@echo "$(CYAN)Running performance tests...$(NC)"
	npx playwright test tests/performance/
	@echo "$(GREEN)✅ All tests completed$(NC)"

# CI-optimized tests (Chrome only, with timeout and retries)
test-ci: build
	@echo "$(CYAN)🔄 Running CI test suite (Chrome only)...$(NC)"
	CI=true timeout 300s npx playwright test tests/e2e/visual-chrome.spec.js tests/e2e/issue-detection.spec.js --project=chromium --retries=1 --workers=1 --reporter=dot --timeout=30000
	@echo "$(GREEN)✅ CI tests completed$(NC)"

# Generate documentation screenshots
screenshots: build
	@echo "$(CYAN)📸 Generating documentation screenshots...$(NC)"
	@echo "$(YELLOW)This will take a few minutes to capture all screen sizes and themes$(NC)"
	npx playwright test tests/visual/generate-screenshots.spec.js --project=chromium
	@echo "$(GREEN)✅ Screenshots generated in docs/screenshots/$(NC)"