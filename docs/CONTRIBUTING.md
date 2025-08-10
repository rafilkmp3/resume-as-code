# 🤝 Contributing Guide

## Welcome Contributors

While this is primarily a personal portfolio project, contributions and suggestions are welcome! This guide will help you set up a development environment and understand the project structure.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm 8+
- **Docker** (optional, but recommended)
- **Git** with proper configuration
- **Mac/Linux/Windows** with WSL2 support

### Initial Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/resume-as-code.git
cd resume-as-code

# 2. Install dependencies and setup tools
make install

# 3. Verify everything is working
make status

# 4. Start development server
make dev
# 🌐 Available at: http://localhost:3000
```

## 🏗️ Project Architecture

### Directory Structure

```
📦 resume-as-code/
├── 📁 assets/              # Images and static assets
├── ⚙️ config/              # Testing and build configuration
├── 📁 docs/                # Documentation and screenshots
├── 🐳 docker/              # Multi-architecture Docker setup
├── 🔧 scripts/             # Build and automation scripts
├── 🧪 tests/               # Comprehensive test suite
├── 📋 Makefile             # Developer experience automation
└── 🏠 Root files           # Core project files
```

### Technology Stack

- **Templating**: Handlebars.js for dynamic content
- **PDF Generation**: Puppeteer for high-quality output
- **Testing**: Playwright (E2E) + Jest (Unit)
- **CI/CD**: GitHub Actions with multi-pipeline architecture
- **Containerization**: Docker with multi-arch support (AMD64 + ARM64)

## 🛠️ Development Workflow

### Making Changes

#### 1. **Create a Feature Branch**

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 2. **Development Commands**

```bash
# Start development server with hot reload
make dev

# Build and test your changes
make build
make test

# Check code quality
make test-unit              # Unit tests
make test-accessibility     # WCAG compliance
make test-performance      # Core Web Vitals
```

#### 3. **Docker Development** (Recommended)

```bash
# Use Docker for consistent environment
make docker-dev            # Development server
make docker-prod           # Production testing
make build-images          # Build container images
```

### Code Quality Standards

#### Pre-commit Validation

The project includes comprehensive pre-commit hooks that validate:

- ✅ **JSON/YAML syntax validation**
- 🔒 **Sensitive information detection**
- 📦 **Git LFS compliance for binary files**
- 🧪 **Basic smoke tests**

#### Testing Requirements

All contributions must maintain high testing standards:

```bash
# Required before submitting PR
make test                  # Full test suite
make test-unit            # Unit test coverage
make test-e2e             # Cross-browser testing
make test-visual          # Visual regression testing
```

#### Code Style

- **JavaScript**: Follow existing patterns and use meaningful variable names
- **HTML/CSS**: Maintain responsive design and accessibility standards
- **Documentation**: Update README and docs for any feature changes

## 🧪 Testing Guidelines

### Test Types

#### 1. **Unit Tests** (Jest)

- **Location**: `tests/unit/`
- **Purpose**: Core functionality validation
- **Requirements**: Maintain >80% code coverage

```bash
# Run unit tests with coverage
make test-unit

# Run specific test file
npx jest tests/unit/theme-utils.test.js
```

#### 2. **End-to-End Tests** (Playwright)

- **Location**: `tests/e2e/`
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, tablet, mobile

```bash
# Run E2E tests
make test-e2e

# Run specific browser
npx playwright test --project=desktop-chrome
```

#### 3. **Visual Regression Tests**

- **Purpose**: Prevent UI regressions
- **Baseline**: Reference screenshots for comparison
- **Coverage**: Multiple themes and devices

```bash
# Update visual baselines (when UI changes are intentional)
npx playwright test --update-snapshots
```

#### 4. **Accessibility Tests**

- **Standards**: WCAG 2.1 AA compliance
- **Coverage**: Keyboard navigation, screen readers, color contrast
- **Tools**: Playwright accessibility testing

### Docker Testing

#### Browser-Specific Testing

```bash
# Test with specific browser images
docker run --rm ghcr.io/rafilkmp3/resume-as-code-chromium:1.14.0
docker run --rm ghcr.io/rafilkmp3/resume-as-code-firefox:1.14.0
docker run --rm ghcr.io/rafilkmp3/resume-as-code-webkit:1.14.0
```

#### Multi-Architecture Validation

```bash
# Test on different architectures (if available)
docker run --platform linux/amd64 --rm <image>
docker run --platform linux/arm64 --rm <image>
```

## 📝 Contribution Types

### 🐛 Bug Fixes

#### Process

1. **Create Issue**: Describe the bug with reproduction steps
2. **Fix Branch**: `fix/issue-description`
3. **Tests Required**: Unit tests for the fix + regression tests
4. **Documentation**: Update if behavior changes

#### Example

```bash
git checkout -b fix/mobile-header-alignment
# Make your changes
make test
git commit -m "fix: correct mobile header alignment on iOS Safari"
```

### ✨ New Features

#### Process

1. **Discussion**: Open issue to discuss the feature first
2. **Feature Branch**: `feature/feature-name`
3. **Comprehensive Tests**: Unit + E2E + Visual tests
4. **Documentation**: README and code documentation updates

#### Example

```bash
git checkout -b feature/print-friendly-mode
# Implement feature with tests
make test-visual  # Update baselines if needed
git commit -m "feat: add print-friendly mode toggle"
```

### 📚 Documentation

#### Areas for Improvement

- Code comments and inline documentation
- README enhancements
- API documentation
- Tutorial content

### 🎨 Design & UX

#### Guidelines

- **Mobile-First**: Ensure responsive design
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Performance**: No impact on Core Web Vitals
- **Cross-Browser**: Test on all supported browsers

## 🔄 Pull Request Process

### 1. **Pre-Submission Checklist**

- [ ] **Tests Pass**: All test suites pass locally
- [ ] **Build Success**: `make build` completes without errors
- [ ] **Documentation**: Updated for any API or behavior changes
- [ ] **Visual Testing**: Screenshots updated if UI changed
- [ ] **Accessibility**: WCAG compliance maintained
- [ ] **Performance**: No regression in Core Web Vitals

### 2. **Pull Request Template**

```markdown
## 📝 Description

Brief description of the change and which issue it fixes.

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] E2E tests cover new functionality
- [ ] Visual regression tests updated
- [ ] Manual testing completed

## 📱 Device Testing

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet (iPad, Android tablets)

## ♿ Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility maintained
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus management implemented

## 📊 Performance Impact

- [ ] Bundle size impact assessed
- [ ] Core Web Vitals not affected
- [ ] Image optimization verified

## 🔗 Related Issues

Fixes #(issue number)
```

### 3. **Review Process**

#### Automated Checks

- ✅ **CI Pipeline**: All GitHub Actions must pass
- ✅ **Docker Builds**: Multi-arch images build successfully
- ✅ **Quality Gates**: Test coverage and performance maintained

#### Manual Review

- **Code Quality**: Readability, maintainability, performance
- **Design Consistency**: UI/UX alignment with project standards
- **Security**: No vulnerabilities or sensitive data exposure

### 4. **Merge Requirements**

- ✅ All automated checks pass
- ✅ At least one approving review (for external contributors)
- ✅ No conflicts with main branch
- ✅ Linear commit history preferred

## 🐳 Docker & Multi-Architecture

### Local Development with Docker

```bash
# Check your architecture
docker version --format '{{.Server.Arch}}'

# Use architecture-appropriate commands
make docker-dev    # Auto-detects your platform
make build-images  # Build all browser images
```

### Testing Multi-Architecture Support

#### AMD64 Testing (GitHub Actions simulation)

```bash
docker run --platform linux/amd64 --rm \
  ghcr.io/rafilkmp3/resume-as-code-chromium:1.14.0
```

#### ARM64 Testing (Mac Apple Silicon)

```bash
docker run --platform linux/arm64 --rm \
  ghcr.io/rafilkmp3/resume-as-code-chromium:1.14.0
```

### Contributing to Docker Infrastructure

#### Dockerfile Changes

- **Location**: `docker/` directory
- **Testing**: Verify both architectures build successfully
- **Documentation**: Update [DOCKER.md](DOCKER.md) for significant changes

#### CI/CD Pipeline Changes

- **Files**: `.github/workflows/*.yml`
- **Testing**: Use `workflow_dispatch` for testing
- **Documentation**: Update [CI-CD.md](CI-CD.md) for workflow changes

## 🚨 Common Issues & Solutions

### Development Environment

#### Port Conflicts

```bash
# Check what's using ports 3000/3001
lsof -ti:3000
lsof -ti:3001

# Kill processes if needed
npx kill-port 3000 3001
```

#### Docker Issues

```bash
# Clear Docker cache
make docker-clean

# Rebuild without cache
docker system prune -a
make build-images
```

#### Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Testing Issues

#### Playwright Browser Installation

```bash
# Reinstall browsers
npx playwright install
npx playwright install-deps
```

#### Visual Test Failures

```bash
# Update baselines (only if UI changes are correct)
npx playwright test --update-snapshots
```

#### E2E Test Flakiness

- Check for timing issues in tests
- Ensure proper wait conditions
- Verify test isolation

## 📞 Getting Help

### Resources

- **📖 Documentation**: Check `docs/` directory first
- **💬 Discussions**: GitHub Discussions for questions
- **🐛 Issues**: GitHub Issues for bug reports
- **📧 Direct Contact**: [rafaelbsathler@gmail.com](mailto:rafaelbsathler@gmail.com)

### Common Questions

#### Q: How do I add a new test?

A: Follow existing patterns in `tests/` directory. Unit tests go in `tests/unit/`, E2E tests in `tests/e2e/`.

#### Q: How do I update the resume content?

A: Edit `resume-data.json` for content changes, or `template.html` for layout changes.

#### Q: How do I test Docker changes locally?

A: Use `make build-images` to build locally, then test with `docker run` commands.

#### Q: My PR failed CI, what should I do?

A: Check the GitHub Actions logs, fix the issues, and push updates to your branch.

## 🏆 Recognition

Contributors will be recognized in:

- **README.md**: Contributor acknowledgments
- **Git History**: Proper commit attribution
- **GitHub**: Contributor graph and statistics

## 📜 Code of Conduct

### Our Standards

- **Respectful**: Treat all contributors with respect and kindness
- **Inclusive**: Welcome contributors from all backgrounds
- **Constructive**: Provide helpful feedback and suggestions
- **Professional**: Maintain professionalism in all interactions

### Reporting Issues

If you experience any issues with community interactions, please contact [rafaelbsathler@gmail.com](mailto:rafaelbsathler@gmail.com).

---

## 🎉 Thank You

Thank you for contributing to this project! Every contribution, no matter how small, helps make this portfolio project better and showcases the power of collaborative development.

**Happy coding! 🚀**

---

_Built with ❤️ by the open source community_
