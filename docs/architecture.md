# Architecture Overview

This is a **resume generation system** built with infrastructure-as-code principles.

## Core Technology Stack

- **Template Engine**: Handlebars.js for dynamic HTML generation from JSON data
- **PDF Generation**: Puppeteer for high-quality PDF export
- **Build System**: Node.js scripts with Docker containerization
- **Testing**: Jest (unit) + Playwright (E2E/visual/accessibility/performance)
- **CI/CD**: GitHub Actions with multi-stage pipeline
- **Development**: Hot-reload dev server with file watching

## Project Structure

```text
├── scripts/
│   ├── build.js           # Main build script (HTML + PDF generation)
│   ├── dev-server.js      # Development server with hot reload
│   ├── server.js          # Production server
│   └── utils/             # Shared utilities
├── src/
│   ├── index.html         # Generated HTML resume
│   └── components/        # JavaScript components
├── tests/                 # Comprehensive test suite
│   ├── unit/             # Jest unit tests
│   ├── integration/      # Build and deployment tests
│   └── *.spec.js         # Playwright E2E tests
├── assets/               # Static assets (images, etc.)
├── dist/                 # Build output (HTML, PDF, assets)
├── src/
│   ├── resume-data.json  # Resume content data
│   └── templates/
│       └── template.html # Handlebars template
└── Makefile             # Developer experience automation
```

## Key Build Process

1. **Data-Driven**: Resume content stored in `resume-data.json`
2. **Template System**: `template.html` uses Handlebars for dynamic content
3. **Asset Management**: Automatic copying of assets to dist/ directory
4. **QR Code Generation**: Dynamic QR codes for online version links
5. **PDF Export**: Puppeteer generates print-ready PDFs with proper metadata
6. **Responsive Design**: Mobile-first with dark/light mode support

## Docker Compose Architecture (Enhanced)

- **All commands use Docker Compose** - no local Node.js installation required
- **Service-based architecture** with dedicated containers for each workflow
- **Port allocation strategy** for predictable development experience
- **Mobile testing support** with LAN IP detection for cross-device testing
- **Background development server** that runs continuously while working

### Port Allocation Strategy

- **Port 3000**: Development server with hot reload (always running in background)
- **Port 3001**: Production preview server (built content)
- **Port 3002**: CI and automated testing exclusive port

### Docker Compose Services

- **`dev`**: Development server with hot reload and mobile LAN access
- **`build`**: Build service for HTML + PDF generation
- **`serve`**: Production preview server for built content
- **`test`**: Visual testing with comprehensive viewport/theme matrix (20 combinations)
- **`pdf-validate`**: PDF validation for all 3 variants (screen, print, ATS)
- **`test-all`**: Complete test suite runner

## Testing Strategy

- **Unit Tests**: Jest with jsdom for DOM manipulation and utilities
- **E2E Tests**: Playwright across multiple browsers and devices
- **Visual Regression**: Screenshot-based testing with baselines
- **Accessibility**: WCAG 2.1 AA compliance validation
- **Performance**: Core Web Vitals monitoring
- **Cross-Device**: Desktop (1280x720), iPhone 15 Pro Max, iPad Pro

## Important Implementation Details

- **Handlebars Helpers**: Custom helpers for JSON stringification and equality comparison
- **Asset Copying**: Recursive copying from assets/ to dist/assets/
- **PDF Optimization**: Print media emulation with professional metadata
- **Error Handling**: Graceful degradation if PDF generation fails
- **Security**: Puppeteer runs with sandbox disabled for Docker compatibility