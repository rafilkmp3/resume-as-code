#!/usr/bin/env node
/**
 * CI Script: Inject current version into documentation placeholders
 * This replaces {{VERSION}}, {{MAJOR}}, {{MINOR}}, {{PATCH}} placeholders
 * Used during CI/CD to ensure documentation always shows correct versions
 */

const fs = require('fs');
const path = require('path');

// Get current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const [major, minor, patch] = version.split('.');

console.log(`🔄 Injecting version ${version} into documentation...`);

// Placeholders to replace
const placeholders = {
  '{{VERSION}}': version,
  '{{MAJOR}}': major,
  '{{MINOR}}': minor,
  '{{PATCH}}': patch,
  '{{MAJOR}}.{{MINOR}}': `${major}.${minor}`,
};

// Files to process
const docsDir = 'docs';
const filesToProcess = [
  'docs/DOCKER.md',
  'docs/CONTRIBUTING.md',
  'docs/CI-CD.md',
  'docs/ARCHITECTURE.md',
  'docs/VERSIONING.md',
  'README.md',
];

let processedFiles = 0;
let totalReplacements = 0;

// Process each file
filesToProcess.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileReplacements = 0;

      // Replace all placeholders
      Object.entries(placeholders).forEach(([placeholder, value]) => {
        const regex = new RegExp(
          placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        );
        const matches = (content.match(regex) || []).length;
        if (matches > 0) {
          content = content.replace(regex, value);
          fileReplacements += matches;
          console.log(`   ${placeholder} → ${value} (${matches} times)`);
        }
      });

      // Write updated content if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        processedFiles++;
        totalReplacements += fileReplacements;
        console.log(
          `✅ Processed ${filePath} (${fileReplacements} replacements)`
        );
      } else {
        console.log(`⏭️  No placeholders found in ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

// Summary
console.log('');
console.log('📋 Injection Summary:');
console.log(`   Version injected: ${version}`);
console.log(`   Files processed: ${processedFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);

if (processedFiles > 0) {
  console.log('');
  console.log('✅ Version injection completed successfully!');
  console.log(
    '💡 Documentation now shows current version in all examples and references.'
  );
} else {
  console.log('');
  console.log('ℹ️  No files needed version injection.');
}

// Return status for CI
process.exit(0);
