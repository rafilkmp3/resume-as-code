# 📁 Assets Directory

Static assets for the Resume-as-Code project, optimized for web performance and print quality.

## 📂 Structure

```
assets/
└── images/
    └── profile.jpeg    # Professional profile photograph
```

## 🖼️ Image Assets

### **Profile Image (`images/profile.jpeg`)**

- **Format**: JPEG (optimized for web)
- **Purpose**: Professional profile photograph
- **Usage**: Displayed in resume header section
- **Optimization**: Compressed for web performance
- **Responsive**: Automatically scaled for different viewports
- **Print**: Hidden in print layout for professional appearance

## 🎨 Asset Guidelines

### **Image Specifications**

- **Format**: JPEG for photographs, PNG for graphics with transparency
- **Compression**: Optimized for web without quality loss
- **Dimensions**: Responsive sizing based on viewport
- **Accessibility**: All images include appropriate alt text

### **Performance Optimization**

- **Lazy Loading**: Images load progressively
- **Format Selection**: Modern formats where supported
- **Compression**: Balanced quality vs. file size
- **Caching**: Proper browser cache headers

### **Print Optimization**

- **Profile Image**: Hidden in print layout to save space
- **Professional Appearance**: Clean, distraction-free print output
- **High Contrast**: Ensures readability in print format

## 🔄 Asset Pipeline

### **Build Process**

1. **Copy**: Assets copied to `dist/assets/` during build
2. **Optimization**: Images optimized for web delivery
3. **Validation**: Asset integrity checked during CI/CD
4. **Deployment**: Assets deployed with proper caching headers

### **Development Workflow**

```bash
# Assets are automatically copied during build
make build

# Check asset status
make status
```

## 📱 Responsive Behavior

### **Profile Image Responsive Rules**

- **Desktop**: Full size with proper aspect ratio
- **Tablet**: Scaled appropriately for layout
- **Mobile**: Optimized for smaller screens
- **Print**: Hidden to maintain professional appearance

### **Dark Mode Support**

- **Profile Image**: Maintains quality in both light and dark themes
- **Border Handling**: Proper contrast borders in dark mode
- **Theme Consistency**: Assets work seamlessly across themes

## 🎯 Adding New Assets

### **Image Assets**

1. **Add to `assets/images/`**
2. **Optimize for web** (compression, format)
3. **Update build process** if needed
4. **Test across devices** and themes
5. **Verify print layout** behavior

### **Best Practices**

- **File Naming**: Use descriptive, lowercase names
- **Size Optimization**: Compress without quality loss
- **Format Selection**: Choose appropriate format (JPEG/PNG/WebP)
- **Accessibility**: Include proper alt text and descriptions
- **Print Considerations**: Consider print layout impact

## 🔍 Asset Validation

Assets are validated during:

- **Build Process**: Integrity checks during build
- **CI/CD Pipeline**: Automated validation in CI
- **Visual Tests**: Screenshot comparison includes assets
- **Performance Tests**: Asset loading performance monitoring

## 📊 Performance Metrics

Target metrics for assets:

- **Load Time**: < 1 second for all assets
- **File Size**: Profile image < 100KB optimized
- **Format Support**: Modern format fallbacks
- **Caching**: Proper cache headers for browser optimization

---

_Assets are optimized for performance, accessibility, and professional presentation across all platforms._
