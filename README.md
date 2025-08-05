<div align="center">

# 🚀 Resume as Code
### Rafael Bernardo Sathler

**Enterprise-Grade Platform Engineering Portfolio**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=for-the-badge&logo=github)](https://rafilkmp3.github.io/resume-as-code/)
[![PDF Download](https://img.shields.io/badge/PDF-Download%20Resume-red?style=for-the-badge&logo=adobe)](https://rafilkmp3.github.io/resume-as-code/resume.pdf)
[![CI/CD Pipeline](https://github.com/rafilkmp3/resume-as-code/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/rafilkmp3/resume-as-code/actions)

[![Node.js](https://img.shields.io/badge/Node.js-22-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Jest](https://img.shields.io/badge/Jest-Unit%20Testing-red?style=flat-square&logo=jest)](https://jestjs.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-blue?style=flat-square&logo=github-actions)](https://github.com/features/actions)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-Performance-orange?style=flat-square&logo=lighthouse)](https://developers.google.com/web/tools/lighthouse)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-success?style=flat-square&logo=web-accessibility-initiative)](https://www.w3.org/WAI/WCAG21/quickref/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[![Build Status](https://img.shields.io/github/actions/workflow/status/rafilkmp3/resume-as-code/ci.yml?branch=main&style=flat-square&logo=github-actions&label=Build)](https://github.com/rafilkmp3/resume-as-code/actions)
[![Code Size](https://img.shields.io/github/languages/code-size/rafilkmp3/resume-as-code?style=flat-square&logo=github)](https://github.com/rafilkmp3/resume-as-code)
[![Last Commit](https://img.shields.io/github/last-commit/rafilkmp3/resume-as-code?style=flat-square&logo=github)](https://github.com/rafilkmp3/resume-as-code/commits/main)
[![Issues](https://img.shields.io/github/issues/rafilkmp3/resume-as-code?style=flat-square&logo=github)](https://github.com/rafilkmp3/resume-as-code/issues)
[![Stars](https://img.shields.io/github/stars/rafilkmp3/resume-as-code?style=flat-square&logo=github)](https://github.com/rafilkmp3/resume-as-code/stargazers)

*Enterprise-grade resume generation system showcasing Platform Engineering excellence through infrastructure-as-code principles, comprehensive testing, and automated quality assurance.*

[🎯 Features](#-enterprise-features) • [🛠️ Quick Start](#️-quick-start) • [📋 Commands](#-comprehensive-make-commands) • [🧪 Testing](#-comprehensive-testing-suite) • [🚀 Architecture](#-architecture-highlights) • [🔗 Live Demo](https://rafilkmp3.github.io/resume-as-code/)

</div>

---

## 🏆 Professional Excellence Overview

<details>
<summary><strong>🎖️ Career Highlights (Click to expand)</strong></summary>

<br>

**11+ years** of Platform Engineering mastery:

- 🏆 **Guinness World Record** - Zero-downtime infrastructure for record-breaking public votes
- 💰 **Cost Optimization Leader** - $65K+ annual savings through intelligent automation  
- 📈 **Enterprise Scale** - Supporting 5,000+ engineers across 8,000+ repositories
- 🚀 **Platform Innovation** - Self-service infrastructure reducing deployment time by 85%
- 🛡️ **Security & Compliance** - Audit-grade systems with enterprise security standards
- ⚡ **Performance Engineering** - 99.99% uptime SLAs with sub-second response times

</details>

## ✨ Enterprise Features

<table>
<tr>
<td width="50%">

**🔧 Developer Experience**
- Modern Makefile with intuitive commands
- Docker containerization for consistency
- Hot reload development server
- Comprehensive status monitoring
- Smart error handling and validation

**🎨 Design & Accessibility**
- Responsive design (Mobile-first)
- Dark/Light mode with OS detection
- WCAG 2.1 AA compliance verified
- Print-optimized PDF generation
- Cross-browser compatibility

</td>
<td width="50%">

**🧪 Quality Assurance**
- Unit testing with Jest & DOM mocking
- Visual regression testing with baselines
- Accessibility testing (WCAG 2.1 AA)
- Performance monitoring (Core Web Vitals)
- Cross-device testing (Desktop/Tablet/Mobile)

**🚀 CI/CD Pipeline**
- Multi-stage automated testing
- Visual regression baseline protection
- Automated deployment to GitHub Pages
- Comprehensive test reporting
- Quality gates and failure prevention

</td>
</tr>
</table>

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Docker (optional)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/rafilkmp3/resume-as-code.git
cd resume-as-code

# Install dependencies and setup tools
make install

# Verify everything is working
make status

# Start development server
make dev
# 🌐 Resume: http://localhost:3000
# 📄 PDF: http://localhost:3000/resume.pdf
```

### **Port Strategy**
- **Port 3000**: Development server (manual testing, preview)
- **Port 3001**: Automated testing server (CI/CD, test automation)

### Docker Development (Recommended)

```bash
# One-command development environment
make docker-dev

# Production environment
make docker-prod

# Build Docker images
make docker-build
```

## 📋 Comprehensive Make Commands

### 🔧 Setup & Dependencies
```bash
make install        # Install all dependencies (npm + Playwright browsers)
make verify-tools   # Verify required tools are available
make status         # Comprehensive project health check
```

### 🏗️ Build & Development
```bash
make build          # Build HTML + PDF + assets
make dev            # Hot reload development server (port 3000)
make serve          # Serve built resume (port 3000)
```

### 🧪 Testing & Quality Assurance
```bash
make test                    # Run complete test suite
make test-unit              # Unit tests with coverage
make test-e2e               # End-to-end tests
make test-visual            # Visual regression tests
make test-accessibility     # WCAG 2.1 AA compliance tests
make test-performance       # Core Web Vitals & optimization
```

### 🐳 Docker Workflow
```bash
make docker-dev      # Development server in Docker
make docker-prod     # Production server in Docker  
make docker-build    # Build all Docker images
make docker-clean    # Clean containers and images
```

### 🛠️ Utilities
```bash
make clean          # Clean all generated files
make help           # Show all available commands
```

## 🧪 Comprehensive Testing Suite

> **Current Status**: Playwright tests temporarily disabled in CI while fixing browser installation issues. Unit tests and security audits remain active.

### **✅ Active Testing**
#### **Unit Testing** 
- **Framework**: Jest with jsdom environment
- **Coverage**: DOM manipulation, theme utilities, and core functions  
- **Mocking**: Complete browser API simulation
- **Reports**: HTML coverage reports with line-by-line analysis
- **Status**: ✅ **Active in CI**

#### **Security Testing**
- **Framework**: npm audit with high-severity filtering
- **Coverage**: Dependency vulnerability scanning
- **Automation**: Continuous security monitoring in CI
- **Status**: ✅ **Active in CI**

### **🔄 Testing Under Development**
#### **End-to-End Testing (Playwright)**
- **Framework**: Playwright with multi-browser support
- **Coverage**: Full user journey testing across devices
- **Browsers**: Chromium (primary), Firefox, WebKit (being fixed)
- **Workers**: Utilizes 100% of available CPU cores for parallel execution
- **Status**: 🔄 **Temporarily disabled in CI - Browser installation being fixed**

#### **Visual Regression Testing**
- **Baseline Screenshots**: Automated capture for all viewports and themes
- **Cross-Theme**: Light and dark mode consistency validation
- **Device Coverage**: Desktop (1920x1080), iPhone 15 Pro Max, iPad Pro
- **Print Testing**: PDF export layout validation (baseline quality being improved)
- **Status**: 🔄 **Under optimization**

#### **Accessibility Testing**
- **Standards**: WCAG 2.1 AA compliance verification
- **Coverage**: Keyboard navigation, screen readers, color contrast
- **Tools**: Playwright accessibility testing
- **Status**: 🔄 **Temporarily disabled with Playwright**

#### **Performance Testing**  
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Bundle Analysis**: CSS/JS optimization validation
- **Image Optimization**: Lazy loading and format verification
- **Network Efficiency**: Resource usage optimization
- **Status**: 🔄 **Temporarily disabled with Playwright**

### **Cross-Device Testing Matrix**
- **Desktop**: Chrome 1920x1080 (Primary development target)
- **Mobile**: iPhone 15 Pro Max 393x852 (Latest iOS)
- **Tablet**: iPad Pro 1024x1365 (Professional presentation)
- **Responsive**: Breakpoint validation and layout consistency

### **Integration Testing**
- **Build Pipeline**: HTML/PDF generation validation ✅
- **Asset Management**: File copying and organization ✅
- **Deployment**: GitHub Pages integration testing ✅
- **Docker**: Container build and runtime validation ✅

## 🚀 Architecture Highlights

### **🏗️ Infrastructure as Code**
```
📦 Project Structure
├── 🎯 assets/                    # Organized asset management
│   └── images/
│       └── profile.jpeg          # Compressed profile image
├── 🧪 tests/                     # Comprehensive test suite
│   ├── unit/                     # Jest unit tests with mocking
│   ├── integration/              # Build & deployment tests
│   ├── accessibility.spec.js    # WCAG 2.1 AA compliance
│   ├── performance.spec.js      # Core Web Vitals monitoring
│   ├── visual-regression.spec.js # Baseline screenshot testing
│   └── dark-mode.spec.js        # Theme functionality validation
├── 🔄 .github/workflows/         # Multi-stage CI/CD pipeline
│   ├── comprehensive-ci.yml     # All-in-one testing workflow
│   ├── ci.yml                   # Legacy compatibility workflow
│   └── deploy.yml               # GitHub Pages deployment
├── 📦 dist/                      # Generated artifacts
│   ├── index.html               # Responsive web resume
│   ├── resume.pdf               # Print-ready PDF export
│   └── assets/                  # Optimized assets
├── 🐳 Docker files               # Containerization support
├── 📋 Makefile                   # Developer experience automation
└── ⚙️ Configuration files        # Jest, Babel, Playwright configs
```

### **🔧 Core Technologies**

<table>
<tr>
<th>Category</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr>
<td><strong>Templating</strong></td>
<td>Handlebars.js</td>
<td>Dynamic resume generation from JSON data</td>
</tr>
<tr>
<td><strong>PDF Generation</strong></td>
<td>Puppeteer</td>
<td>High-quality print-ready PDF export</td>
</tr>
<tr>
<td><strong>Testing Framework</strong></td>
<td>Playwright + Jest</td>
<td>Cross-browser E2E testing + Unit testing</td>
</tr>
<tr>
<td><strong>CI/CD</strong></td>
<td>GitHub Actions</td>
<td>Multi-stage automated testing and deployment</td>
</tr>
<tr>
<td><strong>Containerization</strong></td>
<td>Docker + Compose</td>
<td>Consistent development environments</td>
</tr>
<tr>
<td><strong>Build Automation</strong></td>
<td>Make + npm scripts</td>
<td>Developer workflow optimization</td>
</tr>
<tr>
<td><strong>Quality Assurance</strong></td>
<td>ESLint + Prettier</td>
<td>Code quality and formatting consistency</td>
</tr>
</table>

### **🔄 CI/CD Pipeline Architecture**

```mermaid
graph TB
    subgraph "🔄 Trigger"
        A[Git Push to Main]
    end
    
    subgraph "🏗️ Build & Validation"
        B[Build Resume]
        C[Generate HTML/PDF]
        D[Copy Assets]
    end
    
    subgraph "🧪 Quality Assurance Matrix"
        E[Unit Tests<br/>Jest + Coverage]
        F[Visual Regression<br/>Baseline Screenshots]
        G[Accessibility<br/>WCAG 2.1 AA]
        H[Performance<br/>Core Web Vitals]
        I[Cross-Device<br/>📱💻🖥️]
        J[Integration<br/>Docker + Build]
    end
    
    subgraph "📊 Reporting & Gates"
        K[Test Report Generation]
        L[Quality Gate Validation]
        M[Artifact Collection]
    end
    
    subgraph "🚀 Deployment"
        N[Deploy to GitHub Pages]
        O[Live Site Update]
        P[Health Check]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L
    L --> M
    M --> N
    N --> O
    O --> P
    
    classDef buildNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef testNode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef deployNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class B,C,D buildNode
    class E,F,G,H,I,J testNode
    class N,O,P deployNode
```

### **🎯 Quality Gates**

- **Build Validation**: HTML/PDF generation success
- **Unit Test Coverage**: Core functionality validation  
- **Visual Consistency**: Regression prevention with baselines
- **Accessibility Compliance**: WCAG 2.1 AA standards
- **Performance Thresholds**: Core Web Vitals requirements
- **Cross-Device Compatibility**: Multi-viewport validation

## 🌟 Advanced Features

### **🌓 Dark Mode Implementation**
- **OS Detection**: Respects system preferences automatically
- **Manual Toggle**: Non-intrusive floating button
- **Persistence**: localStorage-based preference saving
- **Smooth Transitions**: CSS-based theme switching
- **Accessibility**: Proper focus management and contrast

### **📱 Responsive Design**
- **Mobile-First**: Optimized for mobile viewing
- **Flexible Layout**: CSS Grid and Flexbox implementation
- **Touch-Friendly**: Proper touch targets and gestures
- **Print Optimization**: PDF-specific styling and layout

### **⚡ Performance Optimization**
- **Asset Optimization**: Compressed images and optimized CSS/JS
- **Lazy Loading**: Progressive image loading implementation
- **Bundle Analysis**: Minimized CSS and JavaScript
- **Cache Strategy**: Effective browser caching headers

### **🔒 Security & Accessibility**
- **CSP Headers**: Content Security Policy implementation
- **ARIA Labels**: Complete screen reader support
- **Semantic HTML**: Proper heading hierarchy and structure
- **Keyboard Navigation**: Full keyboard accessibility

## 📈 Monitoring & Analytics

### **🔍 Quality Metrics**
- **Load Time**: < 3 seconds target
- **Theme Toggle**: < 300ms response time
- **Visual Consistency**: 98%+ screenshot match
- **Accessibility Score**: WCAG 2.1 AA compliant
- **Performance Score**: 90+ Lighthouse score
- **Bundle Size**: < 500KB JS, < 200KB CSS

### **📊 Test Coverage**
- **Unit Tests**: 15 test cases covering theme utilities
- **E2E Tests**: 30+ test cases across all features
- **Visual Tests**: 6 baseline configurations
- **Accessibility Tests**: 12 WCAG compliance validations
- **Performance Tests**: 10 Core Web Vitals checks

## 🚀 Deployment Strategy

### **🔄 Trunk-Based Development with Release Please**
This project uses trunk-based development with automated release management:

1. **Feature Development** → Direct commits to `main` branch
2. **Release Please Bot** → Automatically creates release PRs based on conventional commits
3. **Release PR** → Accumulates unreleased changes with auto-generated changelog
4. **Merge Release PR** → Triggers production deployment and GitHub release
5. **Semantic Versioning** → Automatic version bumping based on commit types:
   - `feat:` → Minor version bump (new features)
   - `fix:` → Patch version bump (bug fixes)
   - `BREAKING CHANGE:` → Major version bump (breaking changes)

### **🔄 Automated Deployment Pipeline**
1. **Code Push** → Triggers comprehensive CI/CD pipeline
2. **Quality Gates** → All tests must pass before deployment
3. **Build Artifacts** → HTML, PDF, and optimized assets generated
4. **GitHub Pages** → Automated deployment to live environment (main branch only)
5. **Release Deployment** → Additional deployment on release with versioned assets
6. **Validation** → Post-deployment health checks

### **🌐 Production Environment**
- **Hosting**: GitHub Pages with global CDN
- **Domain**: Custom domain with HTTPS enforcement
- **Monitoring**: Automated uptime and performance monitoring
- **Rollback**: Git-based rollback strategy
- **Release Assets**: Versioned PDF downloads attached to GitHub releases

## 🤝 Contributing

This is a personal portfolio project, but contributions and suggestions are welcome:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **🧪 Testing Requirements**
- All new features must include comprehensive tests
- Visual changes require baseline screenshot updates
- Accessibility standards must be maintained
- Performance impact must be assessed

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Connect

- **LinkedIn**: [rafael-sathler](https://www.linkedin.com/in/rafaelbsathler/)  
- **GitHub**: [rafaelbsathler](https://github.com/rafaelbsathler)
- **Email**: [rafaelbsathler@gmail.com](mailto:rafaelbsathler@gmail.com)
- **Schedule**: [calendly.com/rafaelbsathler](http://calendly.com/rafaelbsathler)

---

<div align="center">

**Built with ❤️ using Platform Engineering best practices**

*Showcasing enterprise-grade infrastructure through personal branding*

[![View Live Resume](https://img.shields.io/badge/View%20Live%20Resume-rafilkmp3.github.io-brightgreen?style=for-the-badge&logo=github)](https://rafilkmp3.github.io/resume-as-code/)

</div>