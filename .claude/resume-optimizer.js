#!/usr/bin/env node
/**
 * Resume Optimizer Agent
 * 
 * Enhanced agent based on JSON Resume ecosystem analysis.
 * Optimizes resume content, validates schema compliance, and suggests improvements
 * based on industry standards and GitHub ecosystem patterns.
 * 
 * Usage:
 *   node .claude/resume-optimizer.js
 *   node .claude/resume-optimizer.js --aspect=content
 *   node .claude/resume-optimizer.js --aspect=schema
 *   node .claude/resume-optimizer.js --aspect=seo
 *   node .claude/resume-optimizer.js --validate
 */

const fs = require('fs');
const path = require('path');

class ResumeOptimizer {
  constructor() {
    this.resumeDataPath = 'src/resume-data.json';
    this.schemaPath = 'config/resume-schema.json';
    
    // JSON Resume standard fields based on schema analysis
    this.jsonResumeStandard = {
      required: ['basics', 'work', 'education', 'skills'],
      optional: ['volunteer', 'awards', 'certificates', 'publications', 'languages', 'interests', 'references', 'projects'],
      basics: {
        required: ['name', 'email'],
        recommended: ['label', 'summary', 'location', 'profiles', 'phone', 'url', 'image']
      }
    };

    // Industry best practices from GitHub ecosystem analysis
    this.optimizationRules = {
      content: {
        summary: {
          minLength: 100,
          maxLength: 300,
          recommendation: 'Write a compelling 2-3 sentence summary highlighting your unique value proposition'
        },
        workExperience: {
          minEntries: 2,
          maxEntries: 8,
          highlightsPerRole: { min: 2, max: 5 },
          recommendation: 'Focus on achievements with quantifiable results'
        },
        skills: {
          categorization: ['Technical Skills', 'Programming Languages', 'Frameworks', 'Tools', 'Soft Skills'],
          recommendation: 'Group skills by category and include proficiency levels'
        },
        keywords: {
          density: { min: 2, max: 5 }, // per 100 words
          recommendation: 'Include industry-relevant keywords for ATS optimization'
        }
      },
      seo: {
        metaFields: ['name', 'label', 'summary', 'location', 'skills'],
        urlOptimization: 'Use clean URLs and structured data',
        socialProfiles: ['LinkedIn', 'GitHub', 'Portfolio']
      },
      accessibility: {
        imageAlt: 'Profile images must have descriptive alt text',
        colorContrast: 'Ensure WCAG 2.1 AA compliance',
        semanticStructure: 'Use proper heading hierarchy'
      }
    };

    // Industry keywords database (expandable)
    this.industryKeywords = {
      'software-engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Agile', 'CI/CD', 'Git'],
      'data-scientist': ['Python', 'R', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Visualization', 'Big Data'],
      'product-manager': ['Product Strategy', 'Roadmap', 'User Research', 'Analytics', 'A/B Testing', 'Agile', 'Scrum'],
      'designer': ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems']
    };

    // Performance benchmarks from ecosystem analysis
    this.benchmarks = {
      loadTime: { target: '< 2s', critical: '< 1s' },
      fileSize: { html: '< 100KB', pdf: '< 500KB' },
      mobileOptimization: 'Must be responsive',
      searchRanking: 'Optimize for relevant search terms'
    };
  }

  /**
   * Load and parse resume data
   */
  loadResumeData() {
    try {
      if (!fs.existsSync(this.resumeDataPath)) {
        console.log(`❌ Resume data not found: ${this.resumeDataPath}`);
        return null;
      }
      
      const data = fs.readFileSync(this.resumeDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`❌ Error loading resume data: ${error.message}`);
      return null;
    }
  }

  /**
   * Comprehensive resume analysis
   */
  async analyzeResume() {
    console.log('🔍 Resume Optimizer Analysis Started');
    console.log(`📅 ${new Date().toLocaleString()}`);

    const resumeData = this.loadResumeData();
    if (!resumeData) return false;

    console.log(`\n📄 Analyzing resume data: ${this.resumeDataPath}`);
    
    const analysis = {
      compliance: this.analyzeSchemaCompliance(resumeData),
      content: this.analyzeContent(resumeData),
      seo: this.analyzeSEO(resumeData),
      performance: this.analyzePerformance(resumeData),
      accessibility: this.analyzeAccessibility(resumeData)
    };

    this.displayAnalysisResults(analysis);
    this.generateRecommendations(analysis, resumeData);

    return analysis;
  }

  /**
   * Analyze JSON Resume schema compliance
   */
  analyzeSchemaCompliance(data) {
    console.log(`\n🔍 Schema Compliance Analysis:`);
    
    const compliance = {
      score: 0,
      issues: [],
      recommendations: []
    };

    // Check required fields
    const requiredFields = this.jsonResumeStandard.required;
    let presentFields = 0;
    
    requiredFields.forEach(field => {
      if (data[field]) {
        presentFields++;
        console.log(`   ✅ ${field}: Present`);
      } else {
        console.log(`   ❌ ${field}: Missing`);
        compliance.issues.push(`Missing required field: ${field}`);
      }
    });

    // Check basics section details
    if (data.basics) {
      const basicsRequired = this.jsonResumeStandard.basics.required;
      basicsRequired.forEach(field => {
        if (!data.basics[field]) {
          compliance.issues.push(`Missing required basics.${field}`);
        }
      });

      const basicsRecommended = this.jsonResumeStandard.basics.recommended;
      basicsRecommended.forEach(field => {
        if (!data.basics[field]) {
          compliance.recommendations.push(`Consider adding basics.${field} for better profile completeness`);
        }
      });
    }

    // Calculate compliance score
    compliance.score = Math.round((presentFields / requiredFields.length) * 100);
    console.log(`   📊 Schema Compliance: ${compliance.score}%`);

    return compliance;
  }

  /**
   * Analyze content quality and completeness
   */
  analyzeContent(data) {
    console.log(`\n📝 Content Quality Analysis:`);
    
    const content = {
      score: 0,
      strengths: [],
      improvements: []
    };

    // Analyze summary
    if (data.basics?.summary) {
      const summaryLength = data.basics.summary.length;
      const rules = this.optimizationRules.content.summary;
      
      if (summaryLength >= rules.minLength && summaryLength <= rules.maxLength) {
        content.strengths.push(`Summary length optimal (${summaryLength} chars)`);
      } else {
        content.improvements.push(`Summary should be ${rules.minLength}-${rules.maxLength} characters (currently ${summaryLength})`);
      }
    } else {
      content.improvements.push('Missing professional summary - essential for first impression');
    }

    // Analyze work experience
    if (data.work && Array.isArray(data.work)) {
      console.log(`   💼 Work Experience: ${data.work.length} positions`);
      
      data.work.forEach((job, index) => {
        if (!job.highlights || job.highlights.length === 0) {
          content.improvements.push(`Work position ${index + 1} (${job.position || 'Unknown'}) missing highlights/achievements`);
        } else {
          console.log(`      ✅ ${job.position}: ${job.highlights.length} highlights`);
        }
      });
    } else {
      content.improvements.push('Missing work experience section');
    }

    // Analyze skills organization
    if (data.skills && Array.isArray(data.skills)) {
      console.log(`   🛠️ Skills: ${data.skills.length} skill groups`);
      
      const hasCategories = data.skills.some(skill => skill.keywords && skill.keywords.length > 0);
      if (hasCategories) {
        content.strengths.push('Skills well-organized with keywords');
      } else {
        content.improvements.push('Skills should include keywords for better categorization');
      }
    }

    // Calculate content score
    const totalChecks = 4; // summary, work, skills, structure
    const passedChecks = content.strengths.length;
    content.score = Math.round((passedChecks / totalChecks) * 100);
    console.log(`   📊 Content Quality: ${content.score}%`);

    return content;
  }

  /**
   * Analyze SEO optimization
   */
  analyzeSEO(data) {
    console.log(`\n🔍 SEO & Discoverability Analysis:`);
    
    const seo = {
      score: 0,
      optimizations: [],
      issues: []
    };

    // Check meta fields presence
    const metaFields = this.optimizationRules.seo.metaFields;
    let presentMeta = 0;
    
    metaFields.forEach(field => {
      const fieldValue = field === 'skills' ? data[field] : data.basics?.[field];
      if (fieldValue) {
        presentMeta++;
        seo.optimizations.push(`Meta field present: ${field}`);
      } else {
        seo.issues.push(`Missing SEO meta field: ${field}`);
      }
    });

    // Check social profiles
    if (data.basics?.profiles && Array.isArray(data.basics.profiles)) {
      const socialNetworks = data.basics.profiles.map(p => p.network);
      console.log(`   🌐 Social Profiles: ${socialNetworks.join(', ')}`);
      
      const recommendedProfiles = this.optimizationRules.seo.socialProfiles;
      recommendedProfiles.forEach(network => {
        if (socialNetworks.includes(network)) {
          seo.optimizations.push(`${network} profile linked`);
        } else {
          seo.issues.push(`Consider adding ${network} profile for better discoverability`);
        }
      });
    } else {
      seo.issues.push('Missing social media profiles');
    }

    // Calculate SEO score
    const totalSEOChecks = metaFields.length + this.optimizationRules.seo.socialProfiles.length;
    const optimizedElements = seo.optimizations.length;
    seo.score = Math.round((optimizedElements / totalSEOChecks) * 100);
    console.log(`   📊 SEO Score: ${seo.score}%`);

    return seo;
  }

  /**
   * Analyze performance characteristics
   */
  analyzePerformance(data) {
    console.log(`\n⚡ Performance Analysis:`);
    
    const performance = {
      score: 0,
      metrics: [],
      recommendations: []
    };

    // Analyze data size
    const jsonSize = JSON.stringify(data).length;
    console.log(`   📏 JSON Data Size: ${(jsonSize / 1024).toFixed(2)}KB`);
    
    if (jsonSize < 50000) { // < 50KB
      performance.metrics.push('JSON data size optimal');
    } else {
      performance.recommendations.push('Consider reducing JSON data size for faster loading');
    }

    // Analyze image references
    if (data.basics?.image) {
      console.log(`   🖼️ Profile Image: ${data.basics.image}`);
      if (data.basics.image.startsWith('http')) {
        performance.recommendations.push('Consider using locally optimized profile image');
      } else {
        performance.metrics.push('Using local optimized profile image');
      }
    }

    // Analyze content complexity
    const totalTextContent = this.calculateTotalTextContent(data);
    console.log(`   📝 Total Text Content: ~${Math.round(totalTextContent / 1000)}K characters`);

    performance.score = performance.metrics.length * 25; // Simple scoring
    console.log(`   📊 Performance Score: ${performance.score}%`);

    return performance;
  }

  /**
   * Analyze accessibility features
   */
  analyzeAccessibility(data) {
    console.log(`\n♿ Accessibility Analysis:`);
    
    const accessibility = {
      score: 0,
      features: [],
      improvements: []
    };

    // Check for proper structure
    if (data.basics?.name) {
      accessibility.features.push('Primary name field present for screen readers');
    }

    if (data.basics?.label) {
      accessibility.features.push('Professional label provides context');
    }

    // Check contact information accessibility
    if (data.basics?.email) {
      accessibility.features.push('Email accessible for assistive technologies');
    }

    if (data.basics?.phone) {
      accessibility.features.push('Phone number available for contact');
    }

    // Recommendations
    accessibility.improvements.push('Ensure sufficient color contrast (WCAG 2.1 AA)');
    accessibility.improvements.push('Use semantic HTML structure in templates');
    accessibility.improvements.push('Provide alt text for all images');

    accessibility.score = Math.min(accessibility.features.length * 20, 100);
    console.log(`   📊 Accessibility Score: ${accessibility.score}%`);

    return accessibility;
  }

  /**
   * Display comprehensive analysis results
   */
  displayAnalysisResults(analysis) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 COMPREHENSIVE RESUME ANALYSIS RESULTS');
    console.log(`${'='.repeat(60)}`);

    // Overall score calculation
    const overallScore = Math.round(
      (analysis.compliance.score + 
       analysis.content.score + 
       analysis.seo.score + 
       analysis.performance.score + 
       analysis.accessibility.score) / 5
    );

    console.log(`\n🎯 Overall Resume Score: ${overallScore}%`);
    
    // Score breakdown
    console.log(`\n📋 Score Breakdown:`);
    console.log(`   Schema Compliance: ${analysis.compliance.score}%`);
    console.log(`   Content Quality: ${analysis.content.score}%`);
    console.log(`   SEO Optimization: ${analysis.seo.score}%`);
    console.log(`   Performance: ${analysis.performance.score}%`);
    console.log(`   Accessibility: ${analysis.accessibility.score}%`);

    // Grade assignment
    let grade = 'F';
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'C+';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 60) grade = 'D';

    console.log(`\n🏆 Resume Grade: ${grade}`);
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(analysis, resumeData) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 ACTIONABLE RECOMMENDATIONS');
    console.log(`${'='.repeat(60)}`);

    let priority = 1;

    // High priority: Schema compliance issues
    if (analysis.compliance.issues.length > 0) {
      console.log(`\n🔥 Priority ${priority++}: Schema Compliance`);
      analysis.compliance.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }

    // Medium priority: Content improvements
    if (analysis.content.improvements.length > 0) {
      console.log(`\n📝 Priority ${priority++}: Content Enhancement`);
      analysis.content.improvements.forEach(improvement => {
        console.log(`   • ${improvement}`);
      });
    }

    // SEO improvements
    if (analysis.seo.issues.length > 0) {
      console.log(`\n🔍 Priority ${priority++}: SEO Optimization`);
      analysis.seo.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }

    // Industry-specific recommendations
    this.generateIndustryRecommendations(resumeData);

    // Next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Address high-priority schema compliance issues`);
    console.log(`   2. Enhance content with quantifiable achievements`);
    console.log(`   3. Optimize for search and discoverability`);
    console.log(`   4. Test accessibility and performance`);
    console.log(`   5. Re-run analysis: node .claude/resume-optimizer.js`);
  }

  /**
   * Generate industry-specific keyword recommendations
   */
  generateIndustryRecommendations(resumeData) {
    const label = resumeData.basics?.label?.toLowerCase() || '';
    
    // Detect industry based on label
    let detectedIndustry = null;
    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      if (label.includes(industry.replace('-', ' '))) {
        detectedIndustry = industry;
        break;
      }
    }

    if (detectedIndustry) {
      console.log(`\n🎯 Industry-Specific Recommendations (${detectedIndustry}):`);
      const recommendedKeywords = this.industryKeywords[detectedIndustry];
      
      // Check which keywords are missing
      const currentText = JSON.stringify(resumeData).toLowerCase();
      const missingKeywords = recommendedKeywords.filter(keyword => 
        !currentText.includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0) {
        console.log(`   Consider adding these relevant keywords:`);
        missingKeywords.forEach(keyword => {
          console.log(`   • ${keyword}`);
        });
      } else {
        console.log(`   ✅ Good keyword coverage for ${detectedIndustry}`);
      }
    }
  }

  /**
   * Calculate total text content for performance analysis
   */
  calculateTotalTextContent(data) {
    const textFields = [];
    
    // Extract all text content recursively
    const extractText = (obj) => {
      if (typeof obj === 'string') {
        textFields.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(extractText);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(extractText);
      }
    };

    extractText(data);
    return textFields.join(' ').length;
  }

  /**
   * Validate specific aspect of resume
   */
  async validateAspect(aspect) {
    const resumeData = this.loadResumeData();
    if (!resumeData) return false;

    console.log(`🔍 Validating: ${aspect}`);

    switch (aspect) {
      case 'schema':
        return this.analyzeSchemaCompliance(resumeData);
      case 'content':
        return this.analyzeContent(resumeData);
      case 'seo':
        return this.analyzeSEO(resumeData);
      case 'performance':
        return this.analyzePerformance(resumeData);
      case 'accessibility':
        return this.analyzeAccessibility(resumeData);
      default:
        console.log(`❌ Unknown aspect: ${aspect}`);
        return false;
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--aspect=')) {
      options.aspect = arg.split('=')[1];
    } else if (arg === '--validate') {
      options.validate = true;
    }
  });

  const optimizer = new ResumeOptimizer();

  if (options.aspect) {
    optimizer.validateAspect(options.aspect);
  } else {
    optimizer.analyzeResume().then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

module.exports = ResumeOptimizer;