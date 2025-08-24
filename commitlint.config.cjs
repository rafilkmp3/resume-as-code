/**
 * 🤖 AI-Friendly Commitlint Configuration - GitHub Optimized (2025)
 * 
 * This configuration is optimized for:
 * • AI assistants (like Claude Code) with detailed error guidance
 * • GitHub PR title presentation (no truncation)
 * • Mobile GitHub app compatibility (40 char display)
 * • Git CLI oneline format (50 char optimal)
 * • Release-please automatic changelog generation
 * 
 * GitHub Integration Benefits:
 * • PR titles auto-generated from commit subjects won't be truncated
 * • Full commit messages visible in GitHub commit lists and mobile app
 * • Consistent presentation across GitHub web, mobile, and CLI tools
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // ✅ COMMIT MESSAGE FORMAT: type(scope): subject
    //    Example: "feat(ui): add responsive navigation menu"
    //    Example: "fix: resolve authentication timeout issue"
    
    // 🎯 Allowed commit types (release-please compatible)
    'type-enum': [
      2, // Error level (2 = error, 1 = warning, 0 = disabled)
      'always',
      [
        // 🆕 New features (triggers minor version bump)
        'feat',
        
        // 🐛 Bug fixes (triggers patch version bump)
        'fix',
        
        // 📚 Documentation changes
        'docs',
        
        // 🎨 Code style/formatting (no functional changes)
        'style',
        
        // ♻️  Code refactoring (no functional changes)
        'refactor',
        
        // ⚡ Performance improvements
        'perf',
        
        // 🧪 Tests (adding/updating tests)
        'test',
        
        // 🔧 Maintenance/housekeeping
        'chore',
        
        // 👷 CI/CD related changes
        'ci',
        
        // 📦 Build system/dependencies
        'build'
      ]
    ],
    
    // 🏷️  Optional scopes for better categorization
    'scope-enum': [
      1, // Warning level - scopes are optional but should be from this list if used
      'always',
      [
        // Frontend/UI related
        'ui', 'ux', 'design', 'responsive', 'mobile',
        
        // Backend/API related  
        'api', 'auth', 'db', 'server',
        
        // Infrastructure/DevOps
        'ci', 'build', 'deploy', 'docker', 'deps',
        
        // Documentation/Config
        'docs', 'config', 'env',
        
        // Performance/Security
        'perf', 'security', 'a11y',
        
        // Project specific
        'pdf', 'images', 'analytics', 'seo'
      ]
    ],
    
    // 📏 GitHub-Optimized Length Limits (2025 Best Practices)
    // GitHub PR titles truncate at ~70 chars, but 50 chars ensures full visibility
    // in commit lists, mobile views, and Git CLI output
    'subject-max-length': [2, 'always', 50],
    'subject-min-length': [2, 'always', 10],
    
    // 🔤 Subject format rules
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    
    // 📝 GitHub-Optimized Header Rules (PR Title Compatibility)
    // GitHub PR titles: 70 char limit, but 65 provides buffer for type(scope):
    // "feat(ui): " = 10 chars, leaving 55 chars for subject (aligns with 50 char subject rule)
    'header-max-length': [2, 'always', 65],
    'header-min-length': [2, 'always', 15],
    
    // 🏗️  Type format rules
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    
    // 🔧 Scope format rules (if used)
    'scope-case': [2, 'always', 'lower-case'],
    
    // 📄 GitHub-Optimized Body Rules (Enhanced Readability)
    // GitHub commit view displays body with proper line wrapping at ~72 chars
    'body-leading-blank': [1, 'always'],  // Warning: blank line before body (GitHub readability)
    'body-max-line-length': [2, 'always', 72], // GitHub web UI optimal line length
    'body-case': [1, 'always', 'sentence-case'], // Warning: consistent sentence case
    
    // 🦶 Footer Rules (Breaking changes, issue references)
    'footer-leading-blank': [1, 'always'], // Warning: blank line before footer
    'footer-max-line-length': [2, 'always', 72] // GitHub web UI optimal line length
  },
  
  // 🚫 Disable some overly strict rules
  ignores: [
    // Allow merge commits
    (commit) => commit.includes('Merge branch'),
    (commit) => commit.includes('Merge pull request'),
    
    // Allow initial commits
    (commit) => commit.includes('Initial commit'),
    (commit) => commit.includes('initial commit')
  ],
  
  // 🤖 AI-Friendly error messages with fix examples
  helpUrl: 'https://github.com/rafilkmp3/resume-as-code/blob/main/docs/CONVENTIONAL-COMMITS.md'
};