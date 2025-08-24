#!/usr/bin/env node

/**
 * 🤖 AI-Friendly Commitlint Wrapper
 * 
 * This wrapper provides detailed, actionable error messages specifically
 * designed for AI assistants like Claude Code to understand and fix
 * conventional commit formatting issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Get commit message file path from command line args
const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('❌ Error: No commit message file provided');
  process.exit(1);
}

// Read the commit message
let commitMessage;
try {
  commitMessage = fs.readFileSync(commitMsgFile, 'utf8').trim();
} catch (error) {
  console.error('❌ Error reading commit message file:', error.message);
  process.exit(1);
}

// Skip validation for merge commits and other special commits
if (commitMessage.includes('Merge branch') || 
    commitMessage.includes('Merge pull request') ||
    commitMessage.includes('Initial commit') ||
    commitMessage.includes('initial commit')) {
  console.log('✅ Special commit detected - skipping validation');
  process.exit(0);
}

console.log('🤖 AI-Friendly Commit Validation');
console.log('================================');
console.log(`📝 Commit message: "${commitMessage}"`);
console.log('');

// Run commitlint and capture output
try {
  execSync(`npx commitlint --edit ${commitMsgFile}`, { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ Commit message follows conventional commits format!');
  console.log('🚀 Ready for automated changelog generation');
  process.exit(0);
  
} catch (error) {
  console.log('❌ CONVENTIONAL COMMIT VALIDATION FAILED');
  console.log('=========================================');
  console.log('');
  
  // Parse commitlint error output for specific guidance
  const errorOutput = error.stderr || error.stdout || '';
  
  // AI-Friendly error messages with specific fixes
  if (errorOutput.includes('type-enum')) {
    console.log('🎯 INVALID TYPE ERROR');
    console.log('Problem: The commit type is not allowed');
    console.log('');
    console.log('✅ VALID TYPES:');
    console.log('  feat:     🆕 New features (minor version bump)');
    console.log('  fix:      🐛 Bug fixes (patch version bump)'); 
    console.log('  docs:     📚 Documentation changes');
    console.log('  style:    🎨 Code style/formatting');
    console.log('  refactor: ♻️  Code refactoring');
    console.log('  perf:     ⚡ Performance improvements');
    console.log('  test:     🧪 Tests');
    console.log('  chore:    🔧 Maintenance/housekeeping');
    console.log('  ci:       👷 CI/CD changes');
    console.log('  build:    📦 Build system/dependencies');
    console.log('');
    console.log('🔧 FIX EXAMPLES:');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add new feature description"');
    console.log('  Or:         "fix: resolve authentication issue"');
    console.log('  Or:         "perf: optimize image compression"');
  }
  
  if (errorOutput.includes('subject-min-length')) {
    console.log('📏 SUBJECT TOO SHORT ERROR');
    console.log('Problem: Commit subject must be at least 10 characters');
    console.log('');
    console.log('🔧 FIX: Add more descriptive details');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add responsive navigation menu"');
    console.log('  Or:         "fix: resolve authentication timeout issue"');
  }
  
  if (errorOutput.includes('subject-max-length') || errorOutput.includes('header-max-length')) {
    console.log('📏 SUBJECT TOO LONG ERROR');
    console.log('Problem: Commit header must be 72 characters or less');
    console.log('');
    console.log('🔧 FIX: Shorten the description');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add responsive navigation"');
    console.log('  Or:         "fix: resolve auth timeout"');
    console.log('');
    console.log('💡 TIP: Use the commit body for longer descriptions');
  }
  
  if (errorOutput.includes('subject-case')) {
    console.log('🔤 SUBJECT CASE ERROR');
    console.log('Problem: Subject should be lowercase (sentence case)');
    console.log('');
    console.log('🔧 FIX: Use lowercase for the subject');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add responsive navigation menu"');
    console.log('  Not:        "feat: Add Responsive Navigation Menu"');
  }
  
  if (errorOutput.includes('subject-full-stop')) {
    console.log('🔤 SUBJECT PUNCTUATION ERROR');
    console.log('Problem: Subject should not end with a period');
    console.log('');
    console.log('🔧 FIX: Remove the period at the end');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add responsive navigation menu"');
  }
  
  if (errorOutput.includes('header-min-length')) {
    console.log('📏 HEADER TOO SHORT ERROR');
    console.log('Problem: Complete commit header must be at least 15 characters');
    console.log('');
    console.log('🔧 FIX: Add type and descriptive subject');
    console.log(`  Instead of: "${commitMessage}"`);
    console.log('  Try:        "feat: add navigation menu"');
    console.log('  Or:         "fix: resolve login issue"');
  }
  
  if (errorOutput.includes('scope-enum')) {
    console.log('🏷️  INVALID SCOPE WARNING');
    console.log('Problem: Scope is not in the recommended list (optional)');
    console.log('');
    console.log('✅ RECOMMENDED SCOPES:');
    console.log('  UI/Frontend: ui, ux, design, responsive, mobile');
    console.log('  Backend:     api, auth, db, server'); 
    console.log('  DevOps:      ci, build, deploy, docker, deps');
    console.log('  Docs/Config: docs, config, env');
    console.log('  Other:       perf, security, a11y, pdf, images, analytics, seo');
    console.log('');
    console.log('🔧 FIX EXAMPLES:');
    console.log('  "feat(ui): add responsive navigation menu"');
    console.log('  "fix(auth): resolve login timeout issue"');
    console.log('  "perf(images): optimize profile compression"');
    console.log('');
    console.log('💡 TIP: Scopes are optional, you can also use: "feat: add navigation menu"');
  }
  
  // Generic conventional commits format help
  console.log('');
  console.log('📖 CONVENTIONAL COMMITS FORMAT:');
  console.log('  type(scope): subject');
  console.log('');
  console.log('  Examples:');
  console.log('    feat: add user authentication');
  console.log('    feat(ui): add responsive navigation menu'); 
  console.log('    fix: resolve database connection timeout');
  console.log('    fix(auth): handle invalid token errors');
  console.log('    perf: optimize image compression quality');
  console.log('    docs: update installation instructions');
  console.log('');
  console.log('🔗 Learn more: https://conventionalcommits.org/');
  console.log('🤖 This validation ensures automated changelogs work properly');
  
  process.exit(1);
}