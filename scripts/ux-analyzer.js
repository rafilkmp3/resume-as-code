#!/usr/bin/env node

// =============================================================================
// 🎨 UX Analyzer - Resume as Code
// =============================================================================
// User Experience analysis and optimization recommendations
// Focuses on usability, readability, navigation, and user engagement
// =============================================================================

const fs = require('fs');
const path = require('path');

class UXAnalyzer {
  constructor() {
    this.uxResults = {
      timestamp: new Date().toISOString(),
      categories: {
        navigation: { score: 0, findings: [], recommendations: [] },
        readability: { score: 0, findings: [], recommendations: [] },
        userEngagement: { score: 0, findings: [], recommendations: [] },
        visualDesign: { score: 0, findings: [], recommendations: [] },
        performance: { score: 0, findings: [], recommendations: [] },
      },
      overallScore: 0,
      priorities: [],
    };
  }

  analyzeNavigation() {
    console.log('🧭 Analyzing navigation and user flow...');

    const templatePath = path.join(__dirname, '..', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    let score = 0;
    const findings = [];
    const recommendations = [];

    // Check for skip navigation
    if (htmlContent.includes('skip-link')) {
      findings.push('✅ Skip navigation link present');
      score += 20;
    } else {
      findings.push('❌ Missing skip navigation link');
      recommendations.push('🔗 Add skip navigation for keyboard users');
    }

    // Check for breadcrumbs or navigation structure
    if (htmlContent.includes('nav') || htmlContent.includes('breadcrumb')) {
      findings.push('✅ Navigation structure detected');
      score += 15;
    } else {
      findings.push('⚠️  No explicit navigation structure');
      recommendations.push(
        '📍 Consider adding section navigation for long content'
      );
    }

    // Check for anchor links within document
    const anchorLinks = (htmlContent.match(/#[a-zA-Z-]+/g) || []).length;
    if (anchorLinks > 0) {
      findings.push(`✅ ${anchorLinks} internal anchor links for navigation`);
      score += 15;
    } else {
      findings.push('⚠️  No internal anchor links detected');
      recommendations.push('🔗 Add anchor links for quick section navigation');
    }

    // Check for "Back to top" functionality
    if (
      htmlContent.includes('back-to-top') ||
      htmlContent.includes('scroll-to-top')
    ) {
      findings.push('✅ Back to top functionality');
      score += 10;
    } else {
      findings.push('📈 No back to top functionality');
      recommendations.push('⬆️ Add "back to top" button for long pages');
    }

    // Check for load more buttons (progressive disclosure)
    const loadMoreButtons = (htmlContent.match(/load-more-btn/g) || []).length;
    if (loadMoreButtons > 0) {
      findings.push(`✅ ${loadMoreButtons} progressive disclosure elements`);
      score += 20;
    } else {
      findings.push('📋 No progressive disclosure patterns');
      recommendations.push(
        '📄 Consider progressive disclosure for long content'
      );
    }

    // Check for smooth scrolling
    if (
      htmlContent.includes('smooth') ||
      htmlContent.includes('scroll-behavior')
    ) {
      findings.push('✅ Smooth scrolling behavior');
      score += 10;
    } else {
      findings.push('📱 No smooth scrolling detected');
      recommendations.push('🌊 Add smooth scrolling for better navigation UX');
    }

    // Check for fixed/sticky navigation
    if (htmlContent.includes('fixed') || htmlContent.includes('sticky')) {
      findings.push('✅ Fixed/sticky elements for persistent access');
      score += 10;
    }

    this.uxResults.categories.navigation = {
      score: Math.min(score, 100),
      findings,
      recommendations,
    };
  }

  analyzeReadability() {
    console.log('📖 Analyzing readability and content structure...');

    const templatePath = path.join(__dirname, '..', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    let score = 0;
    const findings = [];
    const recommendations = [];

    // Check for proper heading hierarchy
    const headings = htmlContent.match(/<h[1-6][^>]*>/gi) || [];
    if (headings.length >= 5) {
      findings.push(
        `✅ Good heading structure with ${headings.length} headings`
      );
      score += 25;
    } else {
      findings.push('⚠️  Limited heading structure');
      recommendations.push(
        '📝 Improve heading hierarchy for better content structure'
      );
    }

    // Check for list structures
    const lists = (htmlContent.match(/<ul|<ol/gi) || []).length;
    if (lists >= 3) {
      findings.push(`✅ Good use of lists for content organization (${lists})`);
      score += 15;
    } else {
      findings.push('📋 Limited use of lists');
      recommendations.push('📋 Use more lists to organize information clearly');
    }

    // Check for emphasis and strong elements
    const emphasis = (htmlContent.match(/<strong|<em|<b>/gi) || []).length;
    if (emphasis >= 10) {
      findings.push(`✅ Good use of text emphasis (${emphasis} elements)`);
      score += 15;
    } else {
      findings.push('💬 Limited text emphasis');
      recommendations.push('💪 Use more emphasis to highlight key information');
    }

    // Check for font size and readability indicators
    if (
      htmlContent.includes('font-size') ||
      htmlContent.includes('line-height')
    ) {
      findings.push('✅ Custom typography settings detected');
      score += 20;
    } else {
      findings.push('⚠️  No custom typography detected');
      recommendations.push(
        '🔤 Optimize font sizes and line heights for readability'
      );
    }

    // Check for dark/light mode (readability accommodation)
    if (htmlContent.includes('dark') && htmlContent.includes('light')) {
      findings.push('✅ Theme switching for reading comfort');
      score += 25;
    } else {
      findings.push('🌙 No theme switching detected');
      recommendations.push('🎨 Add dark/light mode for reading comfort');
    }

    this.uxResults.categories.readability = {
      score: Math.min(score, 100),
      findings,
      recommendations,
    };
  }

  analyzeUserEngagement() {
    console.log('🎯 Analyzing user engagement and interactivity...');

    const templatePath = path.join(__dirname, '..', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    let score = 0;
    const findings = [];
    const recommendations = [];

    // Check for interactive elements
    const buttons = (htmlContent.match(/<button/gi) || []).length;
    if (buttons >= 5) {
      findings.push(`✅ Rich interactivity with ${buttons} buttons`);
      score += 20;
    } else {
      findings.push('⚠️  Limited interactive elements');
      recommendations.push('🎮 Add more interactive elements for engagement');
    }

    // Check for animations and transitions
    if (
      htmlContent.includes('transition') ||
      htmlContent.includes('animation')
    ) {
      findings.push('✅ Smooth animations and transitions');
      score += 15;
    } else {
      findings.push('🎬 No animations detected');
      recommendations.push('✨ Add subtle animations for better user feedback');
    }

    // Check for hover effects
    if (htmlContent.includes(':hover')) {
      findings.push('✅ Hover effects for user feedback');
      score += 15;
    } else {
      findings.push('👆 No hover effects detected');
      recommendations.push('🖱️ Add hover effects for interactive feedback');
    }

    // Check for tooltips and help text
    const tooltips = (htmlContent.match(/title="/gi) || []).length;
    if (tooltips >= 5) {
      findings.push(`✅ Good use of tooltips (${tooltips})`);
      score += 15;
    } else {
      findings.push('💭 Limited tooltips');
      recommendations.push('💡 Add more tooltips for user guidance');
    }

    // Check for download/sharing functionality
    const downloadLinks = (htmlContent.match(/download=/gi) || []).length;
    if (downloadLinks >= 1) {
      findings.push(`✅ ${downloadLinks} download options available`);
      score += 20;
    } else {
      findings.push('📥 No download functionality');
      recommendations.push('💾 Add download options for user convenience');
    }

    // Check for QR code or sharing features
    if (htmlContent.includes('qr') || htmlContent.includes('share')) {
      findings.push('✅ Sharing features for social engagement');
      score += 15;
    } else {
      findings.push('🔗 No sharing features');
      recommendations.push('📱 Add QR code or sharing functionality');
    }

    this.uxResults.categories.userEngagement = {
      score: Math.min(score, 100),
      findings,
      recommendations,
    };
  }

  analyzeVisualDesign() {
    console.log('🎨 Analyzing visual design and aesthetics...');

    const templatePath = path.join(__dirname, '..', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    let score = 0;
    const findings = [];
    const recommendations = [];

    // Check for CSS custom properties (design system)
    const customProperties = (htmlContent.match(/--[\w-]+:/g) || []).length;
    if (customProperties >= 10) {
      findings.push(
        `✅ Strong design system with ${customProperties} custom properties`
      );
      score += 25;
    } else {
      findings.push('🎨 Limited design system');
      recommendations.push(
        '🎯 Develop comprehensive design system with CSS custom properties'
      );
    }

    // Check for responsive design patterns
    if (htmlContent.includes('@media')) {
      findings.push('✅ Responsive design implementation');
      score += 25;
    } else {
      findings.push('📱 No responsive design detected');
      recommendations.push('📲 Implement responsive design for all devices');
    }

    // Check for visual hierarchy
    if (htmlContent.includes('gradient') || htmlContent.includes('shadow')) {
      findings.push('✅ Visual depth with gradients and shadows');
      score += 15;
    } else {
      findings.push('⚡ Limited visual depth');
      recommendations.push('🌈 Add gradients and shadows for visual hierarchy');
    }

    // Check for grid or flexbox layout
    if (htmlContent.includes('grid') || htmlContent.includes('flex')) {
      findings.push('✅ Modern layout with CSS Grid/Flexbox');
      score += 20;
    } else {
      findings.push('📐 No modern layout patterns');
      recommendations.push(
        '🏗️ Implement CSS Grid or Flexbox for better layouts'
      );
    }

    // Check for consistent spacing
    if (htmlContent.includes('margin') || htmlContent.includes('padding')) {
      findings.push('✅ Consistent spacing implementation');
      score += 15;
    } else {
      findings.push('📏 No consistent spacing detected');
      recommendations.push('📐 Implement consistent spacing system');
    }

    this.uxResults.categories.visualDesign = {
      score: Math.min(score, 100),
      findings,
      recommendations,
    };
  }

  analyzePerformanceUX() {
    console.log('⚡ Analyzing performance impact on user experience...');

    const templatePath = path.join(__dirname, '..', 'template.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8');

    let score = 0;
    const findings = [];
    const recommendations = [];

    // Check for lazy loading
    if (
      htmlContent.includes('loading="lazy"') ||
      htmlContent.includes('lazy')
    ) {
      findings.push('✅ Lazy loading implementation');
      score += 20;
    } else {
      findings.push('🚀 No lazy loading detected');
      recommendations.push('📸 Implement lazy loading for images');
    }

    // Check for optimized images
    if (htmlContent.includes('webp') || htmlContent.includes('avif')) {
      findings.push('✅ Modern image formats');
      score += 20;
    } else {
      findings.push('🖼️ No modern image formats');
      recommendations.push('🎯 Use WebP/AVIF for better performance');
    }

    // Check for CSS optimization
    const styleSize = (htmlContent.match(/<style>[\s\S]*<\/style>/g) || [''])[0]
      .length;
    if (styleSize < 50000) {
      findings.push('✅ Reasonable CSS size for fast loading');
      score += 15;
    } else {
      findings.push('📦 Large CSS detected');
      recommendations.push('🗜️ Optimize CSS for faster loading');
    }

    // Check for JavaScript optimization
    const scriptSize = (
      htmlContent.match(/<script>[\s\S]*<\/script>/g) || []
    ).join('').length;
    if (scriptSize < 20000) {
      findings.push('✅ Lightweight JavaScript');
      score += 15;
    } else {
      findings.push('⚙️ Heavy JavaScript detected');
      recommendations.push('🚀 Optimize JavaScript for better performance');
    }

    // Check for progressive disclosure
    if (
      htmlContent.includes('load-more') ||
      htmlContent.includes('progressive')
    ) {
      findings.push('✅ Progressive disclosure for performance');
      score += 15;
    } else {
      findings.push('📄 No progressive loading');
      recommendations.push(
        '📋 Implement progressive disclosure for large content'
      );
    }

    // Check for caching hints
    if (
      htmlContent.includes('Cache-Control') ||
      htmlContent.includes('cache')
    ) {
      findings.push('✅ Caching optimization');
      score += 15;
    } else {
      findings.push('🗄️ No caching optimization');
      recommendations.push('💾 Add caching headers for better performance');
    }

    this.uxResults.categories.performance = {
      score: Math.min(score, 100),
      findings,
      recommendations,
    };
  }

  calculateOverallScore() {
    const categories = Object.values(this.uxResults.categories);
    const totalScore = categories.reduce(
      (sum, category) => sum + category.score,
      0
    );
    this.uxResults.overallScore = Math.round(totalScore / categories.length);
  }

  generatePriorities() {
    console.log('🎯 Generating UX improvement priorities...');

    const allRecommendations = [];
    Object.entries(this.uxResults.categories).forEach(([category, data]) => {
      data.recommendations.forEach(rec => {
        allRecommendations.push({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          recommendation: rec,
          impact: this.calculateImpact(rec, data.score),
        });
      });
    });

    // Sort by impact (lowest scoring categories get higher priority)
    allRecommendations.sort((a, b) => b.impact - a.impact);

    this.uxResults.priorities = allRecommendations.slice(0, 8); // Top 8 priorities
  }

  calculateImpact(recommendation, categoryScore) {
    // Lower category scores indicate higher potential impact
    let impact = 100 - categoryScore;

    // Boost certain high-impact improvements
    if (
      recommendation.includes('responsive') ||
      recommendation.includes('mobile')
    )
      impact += 20;
    if (
      recommendation.includes('accessibility') ||
      recommendation.includes('keyboard')
    )
      impact += 15;
    if (
      recommendation.includes('performance') ||
      recommendation.includes('loading')
    )
      impact += 15;
    if (
      recommendation.includes('navigation') ||
      recommendation.includes('skip')
    )
      impact += 10;

    return Math.min(impact, 100);
  }

  generateReport() {
    console.log('\n🎨 UX ANALYSIS REPORT');
    console.log('=====================');

    this.analyzeNavigation();
    this.analyzeReadability();
    this.analyzeUserEngagement();
    this.analyzeVisualDesign();
    this.analyzePerformanceUX();
    this.calculateOverallScore();
    this.generatePriorities();

    console.log('\n📊 UX SCORES BY CATEGORY:');
    Object.entries(this.uxResults.categories).forEach(([category, data]) => {
      const emoji = this.getScoreEmoji(data.score);
      console.log(
        `   ${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${data.score}%`
      );
    });

    console.log(`\n🎯 OVERALL UX SCORE: ${this.uxResults.overallScore}%`);

    console.log('\n🚀 TOP PRIORITY IMPROVEMENTS:');
    this.uxResults.priorities.slice(0, 5).forEach((priority, index) => {
      console.log(
        `   ${index + 1}. [${priority.category}] ${priority.recommendation}`
      );
    });

    console.log('\n📋 DETAILED FINDINGS BY CATEGORY:');
    Object.entries(this.uxResults.categories).forEach(([category, data]) => {
      console.log(`\n${category.toUpperCase()}:`);
      data.findings.forEach(finding => console.log(`   ${finding}`));
      if (data.recommendations.length > 0) {
        console.log('   Recommendations:');
        data.recommendations.forEach(rec => console.log(`     ${rec}`));
      }
    });

    // Save results
    const resultsPath = path.join(__dirname, '..', 'ux-analysis-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.uxResults, null, 2));

    console.log(`\n📁 Full results saved to: ${resultsPath}`);
    console.log('=====================\n');

    return this.uxResults;
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    if (score >= 60) return '🟠';
    return '🔴';
  }
}

// CLI Interface
if (require.main === module) {
  const analyzer = new UXAnalyzer();
  analyzer.generateReport();
}

module.exports = UXAnalyzer;
