# ⚙️ Configuration Directory

This directory contains all centralized configuration files for the Resume as Code project, organized for professional maintainability and clear separation of concerns.

## 📁 File Overview

### **🧪 Testing Configurations**

#### `jest.config.js`
- **Purpose**: Unit testing configuration for Jest
- **Features**: 
  - jsdom environment for DOM testing
  - Coverage reporting with HTML output
  - Test file patterns and exclusions
  - Babel transformation setup

#### `playwright.config.js`
- **Purpose**: End-to-end testing configuration
- **Features**:
  - Multi-browser support (Chrome, Firefox, WebKit)
  - Cross-device testing (Desktop, Tablet, Mobile)
  - Web server automation for testing
  - Retry logic and parallel execution
  - Visual regression test baseline management

#### `playwright.config.docker.js`
- **Purpose**: Docker-specific Playwright configuration
- **Features**:
  - Optimized for containerized environments
  - No web server (assumes external server)
  - Browser-specific Docker image testing

### **🔧 Build Configurations**

#### `babel.config.js`
- **Purpose**: JavaScript transpilation configuration
- **Features**:
  - ES6+ to ES5 compatibility
  - Node.js and browser environment support
  - Jest testing integration
  - Modern JavaScript feature support

## 🚀 Usage

All configuration files are automatically referenced by their respective tools through:

1. **Package.json scripts** - Use `--config=config/[filename]` flags
2. **Makefile commands** - Automatically use relocated configurations  
3. **Docker containers** - Copy and use configurations in build processes

## 📝 Configuration Migration Notes

This directory was created as part of a comprehensive repository reorganization to:
- ✅ Centralize all configuration files
- ✅ Improve project structure clarity
- ✅ Follow industry best practices
- ✅ Reduce root directory clutter
- ✅ Enhance maintainability

### Migration Impact
- All build and test commands updated to reference new paths
- Docker configurations updated for new file locations
- CI/CD pipelines automatically use new structure
- No functionality changes - only organizational improvements

## 🔗 Related Documentation
- [Testing Guide](../tests/README.md)
- [Docker Guide](../docker/README.md)
- [Scripts Documentation](../scripts/README.md)
- [Main README](../README.md)