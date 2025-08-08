# 🧪 Testing Suite

[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Jest](https://img.shields.io/badge/Jest-Unit%20Testing-red?style=flat-square&logo=jest)](https://jestjs.io/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-success?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)

Comprehensive testing suite for the Resume-as-Code project, ensuring quality, accessibility, and performance across all platforms.

## 📁 Test Structure

```
tests/
├── unit/                      # Jest unit tests
│   ├── setup.js              # Test environment configuration
│   └── theme-utils.test.js    # Theme functionality tests
├── integration/               # Build & deployment tests
│   └── build-deploy.spec.js   # End-to-end build validation
├── accessibility.spec.js      # WCAG 2.1 AA compliance tests
├── dark-mode.spec.js         # Dark/light theme testing
├── layout-analysis.spec.js   # Visual layout analysis
├── mobile-layout.spec.js     # Mobile responsiveness tests
├── performance.spec.js       # Core Web Vitals monitoring
├── print-layout.spec.js      # PDF export optimization
├── real-print-test.spec.js   # Browser print preview validation
├── responsive-layout.spec.js # Cross-device compatibility
└── visual-regression.spec.js # Screenshot baseline testing
```

## 🎯 Test Categories

### **✅ Active Tests (Running in CI)**

- **Unit Tests**: Core functionality validation with Jest
- **Security Tests**: Dependency vulnerability scanning

### **🔄 Development Tests (Local Only)**

- **End-to-End Tests**: Full user journey validation
- **Visual Regression**: Screenshot comparison testing
- **Accessibility Tests**: WCAG 2.1 AA compliance verification
- **Performance Tests**: Core Web Vitals monitoring

## 🚀 Running Tests

### **All Tests**

```bash
make test                    # Run complete test suite
```

### **Individual Test Categories**

```bash
make test-unit              # Jest unit tests with coverage
make test-e2e               # Playwright E2E tests
make test-visual            # Visual regression tests
make test-accessibility     # WCAG compliance tests
make test-performance       # Core Web Vitals tests
```

### **Docker-based Testing**

```bash
# Run tests in Docker (matches CI environment)
docker-compose run --rm ci make test-internal
```

## 📊 Test Coverage

### **Unit Tests (Jest)**

- **Framework**: Jest 30.0.5 with jsdom environment
- **Coverage**: DOM manipulation, theme utilities, localStorage
- **Mocking**: Complete browser API simulation
- **Reports**: HTML coverage reports with line-by-line analysis

### **E2E Tests (Playwright)**

- **Browsers**: Chromium (primary), Firefox, WebKit
- **Devices**: Desktop, iPhone 15 Pro Max, iPad Pro
- **Workers**: Utilizes 100% of available CPU cores
- **Retries**: 2 retries in CI for flaky test resilience

### **Visual Regression Testing**

- **Baseline Management**: Automated screenshot capture and comparison
- **Theme Coverage**: Light and dark mode validation
- **Device Matrix**: 3 viewports × 2 themes = 6 baseline configurations
- **Print Testing**: PDF export layout validation

### **Accessibility Testing**

- **Standards**: WCAG 2.1 AA compliance
- **Coverage**: Keyboard navigation, screen readers, color contrast
- **Tools**: Playwright accessibility testing APIs
- **Automation**: Continuous monitoring in development

### **Performance Testing**

- **Core Web Vitals**: LCP, FID, CLS measurement
- **Bundle Analysis**: CSS/JS optimization validation
- **Image Optimization**: Lazy loading verification
- **Network Efficiency**: Resource usage monitoring

## 🔧 Configuration Files

Testing configurations are centralized in the `/config` directory:

- **`../config/playwright.config.js`**: Playwright E2E test configuration
- **`../config/playwright.config.docker.js`**: Docker-specific Playwright configuration
- **`../config/jest.config.js`**: Jest unit test configuration
- **`unit/setup.js`**: Test environment setup and mocking

All test commands automatically reference the centralized configurations through updated Makefile and package.json scripts.

## 🎨 Visual Testing

### **Screenshot Baselines**

Visual regression tests maintain baseline screenshots in:

```
tests/visual-regression.spec.js-snapshots/
├── desktop-light-baseline-desktop-chrome-darwin.png
├── desktop-dark-baseline-desktop-chrome-darwin.png
├── mobile-light-baseline-iphone-15-pro-max-darwin.png
├── mobile-dark-baseline-iphone-15-pro-max-darwin.png
├── print-baseline-desktop-chrome-darwin.png
└── ... (additional device/theme combinations)
```

### **Updating Baselines**

```bash
# Update all visual baselines
npx playwright test --update-snapshots

# Update specific test baselines
npx playwright test visual-regression.spec.js --update-snapshots
```

## 📱 Mobile Testing

Comprehensive mobile testing across:

- **iPhone 15 Pro Max**: 393×852 viewport
- **iPad Pro**: 1024×1366 viewport
- **Desktop**: 1920×1080 viewport

Tests validate:

- Touch target sizes (44px minimum)
- Text readability and contrast
- Layout responsiveness
- Theme toggle functionality
- Print layout optimization

## 🚀 Performance Benchmarks

Performance tests validate:

- **Load Time**: < 3 seconds target
- **Theme Toggle**: < 300ms response time
- **Visual Consistency**: 98%+ screenshot match
- **Accessibility Score**: WCAG 2.1 AA compliant
- **Bundle Size**: < 500KB JS, < 200KB CSS

## 🐛 Debugging

### **Test Reports**

- **Playwright HTML Report**: `playwright-report/index.html`
- **Jest Coverage Report**: `coverage/lcov-report/index.html`
- **Test Results**: `test-results/` directory

### **Debug Commands**

```bash
# Run Playwright tests with UI mode
npx playwright test --ui

# Debug specific test
npx playwright test --debug accessibility.spec.js

# Generate trace files
npx playwright test --trace on
```

## 🔄 CI/CD Integration

Tests are integrated into the CI/CD pipeline:

1. **Unit Tests**: Always run on every commit
2. **Security Tests**: Always run on every commit
3. **E2E Tests**: Currently disabled while fixing browser installation
4. **Visual Tests**: Run locally for baseline updates

## 📈 Metrics & Reporting

- **Test Coverage**: Tracked via Jest coverage reports
- **Performance Metrics**: Core Web Vitals monitoring
- **Accessibility Scores**: WCAG compliance validation
- **Visual Consistency**: Screenshot diff analysis

---

_Tests are designed to ensure enterprise-grade quality and reliability across all platforms and devices._
