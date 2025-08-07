#!/usr/bin/env node
/**
 * Script to update version references across all documentation and configuration files
 * This ensures all Docker image references, examples, and instructions use consistent versioning
 */

const fs = require('fs');
const path = require('path');

// Get current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`🔍 Updating version references to v${currentVersion}...`);

// Files to update with their patterns
const updateTargets = [
  {
    pattern: /ghcr\.io\/rafilkmp3\/resume-as-code-(chromium|firefox|webkit):[\d\.]+/g,
    replacement: (match, browser) => `ghcr.io/rafilkmp3/resume-as-code-${browser}:${currentVersion}`,
    files: [
      'docs/DOCKER.md',
      'docs/CONTRIBUTING.md', 
      'docs/CI-CD.md',
      'docs/ARCHITECTURE.md',
      'README.md'
    ]
  },
  {
    pattern: /resume-rafael-sathler-v[\d\.]+\.pdf/g,
    replacement: `resume-rafael-sathler-v${currentVersion}.pdf`,
    files: [
      'docs/VERSIONING.md',
      '.github/workflows/release-deploy.yml'
    ]
  },
  {
    pattern: /"version":\s*"[\d\.]+"/g,
    replacement: `"version": "${currentVersion}"`,
    files: [
      'docs/VERSIONING.md' // Example version references in docs
    ]
  }
];

// Track updates
let totalUpdates = 0;
let filesUpdated = [];

// Update each target
updateTargets.forEach(target => {
  target.files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        content = content.replace(target.pattern, target.replacement);
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          filesUpdated.push(filePath);
          totalUpdates++;
          console.log(`✅ Updated ${filePath}`);
        } else {
          console.log(`⏭️  No changes needed in ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
});

// Update version in VERSIONING.md examples
const versioningDocPath = 'docs/VERSIONING.md';
if (fs.existsSync(versioningDocPath)) {
  let content = fs.readFileSync(versioningDocPath, 'utf8');
  const originalContent = content;
  
  // Update example version references
  content = content.replace(/v1\.[\d\.]+/g, `v${currentVersion}`);
  content = content.replace(/1\.[\d\.]+/g, currentVersion);
  content = content.replace(/Version `[\d\.]+`/g, `Version \`${currentVersion}\``);
  
  if (content !== originalContent) {
    fs.writeFileSync(versioningDocPath, content);
    if (!filesUpdated.includes(versioningDocPath)) {
      filesUpdated.push(versioningDocPath);
      totalUpdates++;
    }
    console.log(`✅ Updated version examples in ${versioningDocPath}`);
  }
}

// Summary
console.log('');
console.log('📋 Update Summary:');
console.log(`   Version: ${currentVersion}`);
console.log(`   Files updated: ${totalUpdates}`);
console.log(`   Updated files:`, filesUpdated.length > 0 ? filesUpdated : ['None']);

if (totalUpdates > 0) {
  console.log('');
  console.log('✅ Version references updated successfully!');
  console.log('💡 These files now use consistent semantic versioning for Docker images and artifacts.');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Review the updated files');
  console.log('   2. Commit changes with conventional commit format'); 
  console.log('   3. CI will auto-tag Docker images with new version');
} else {
  console.log('');
  console.log('ℹ️  All files already use the current version.');
}