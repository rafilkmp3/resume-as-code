# 📁 Documentation & Visual Assets

This directory contains all project documentation, visual previews, and supporting materials for the Resume as Code project.

## 📊 Visual Preview Gallery

### **📱 Screenshots Directory**

Professional visual previews showcasing responsive design and user experience:

#### **Device Coverage**

- **`desktop-full-page.png`** - Professional desktop layout (1920x1080)
- **`mobile-full-page.png`** - Mobile-first responsive design (iPhone 15 Pro Max)
- **`tablet-full-page.png`** - Tablet optimization (iPad Pro)

#### **Theme Variations**

- **`mobile-dark-mode.png`** - Dark theme implementation with OS detection
- **`desktop-date-hover.png`** - Interactive elements and hover states

#### **Visual Testing Integration**

These screenshots serve dual purposes:

1. **Documentation**: Visual preview for GitHub README and project showcases
2. **Testing**: Baseline references for visual regression testing with Playwright

## 🖼️ Image Specifications

### **Optimization Standards**

- **Format**: PNG for UI screenshots (lossless quality)
- **Resolution**: Native device resolutions for accuracy
- **Compression**: Optimized for web display while maintaining clarity
- **Naming**: Descriptive naming convention for easy identification

### **Usage in Documentation**

All screenshots are embedded in the main README.md with:

- Responsive sizing for different viewing contexts
- Alt text for accessibility compliance
- Semantic organization (desktop → mobile → interactive)

## 📋 Documentation Structure

### **Current Files**

- **`README.md`** (this file) - Documentation guide and visual asset overview
- **`screenshots/`** - Visual preview gallery with device-specific captures

### **Planned Additions**

- **Architecture diagrams** - System design and data flow visualizations
- **API documentation** - Template engine and build process APIs
- **Deployment guides** - Step-by-step deployment instructions
- **Contributing guidelines** - Development workflow and standards

## 🔧 Integration with Main Project

### **README.md Integration**

Screenshots are embedded in the main README using relative paths:

```markdown
<img src="docs/screenshots/desktop-full-page.png" alt="Desktop Full Page" width="300"/>
```

### **Testing Integration**

Visual regression tests reference these screenshots as baseline images:

- Playwright captures current state
- Compares against baseline screenshots
- Identifies visual regressions automatically

### **CI/CD Integration**

- Screenshots updated automatically during visual regression test runs
- New baselines generated when intentional design changes occur
- Version controlled for change tracking and rollback capability

## 📈 Continuous Documentation Strategy

### **Automated Updates**

- Screenshots refreshed during major UI changes
- Visual regression baselines maintained automatically
- Documentation versioning aligned with semantic release process

### **Quality Standards**

- All images optimized for web performance
- Consistent naming and organization
- Comprehensive alt text for accessibility
- Mobile-first documentation approach

## 🔗 Related Files and Directories

- [Main README](../README.md) - Project overview and quick start
- [Visual Tests](../tests/visual-regression.spec.js) - Automated visual testing
- [Assets Directory](../assets/) - Project assets and resources
- [Build Scripts](../scripts/) - Documentation generation automation

---

**Note**: This directory was created during the comprehensive repository reorganization to establish professional documentation standards and centralize visual assets.
