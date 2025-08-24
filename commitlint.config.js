/**
 * 🤖 AI-Friendly Commitlint Configuration
 * 
 * This configuration is optimized for AI assistants (like Claude Code) 
 * to create perfect conventional commits with detailed error guidance.
 * 
 * Rules aligned with release-please for automatic changelog generation.
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
    
    // 📏 Subject length limits (GitHub displays ~50 chars in lists)
    'subject-max-length': [2, 'always', 72],
    'subject-min-length': [2, 'always', 10],
    
    // 🔤 Subject format rules
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    
    // 📝 Header format rules
    'header-max-length': [2, 'always', 72],
    'header-min-length': [2, 'always', 15],
    
    // 🏗️  Type format rules
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    
    // 🔧 Scope format rules (if used)
    'scope-case': [2, 'always', 'lower-case']
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