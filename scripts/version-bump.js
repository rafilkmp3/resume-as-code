#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

// Parse semantic version
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) throw new Error(`Invalid version format: ${version}`);
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null
  };
}

// Format version object to string
function formatVersion(version) {
  let versionString = `${version.major}.${version.minor}.${version.patch}`;
  if (version.prerelease) {
    versionString += `-${version.prerelease}`;
  }
  return versionString;
}

// Analyze commit messages since last tag to determine version bump
function analyzeCommits() {
  try {
    // Get the last tag
    let lastTag;
    try {
      lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim();
    } catch (error) {
      console.log('📝 No previous tags found, starting from commits since repository creation');
      lastTag = null;
    }
    
    // Get commits since last tag (or all commits if no tag)
    const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    let commits;
    try {
      commits = execSync(`git log ${commitRange} --oneline --no-merges`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(line => line.length > 0);
    } catch (error) {
      console.log('📝 No commits found in range');
      return { type: 'none', commits: [] };
    }
    
    console.log(`📊 Analyzing ${commits.length} commits since ${lastTag || 'repository creation'}:`);
    commits.forEach(commit => console.log(`  • ${commit}`));
    
    let hasMajorChange = false;
    let hasMinorChange = false;
    let hasPatchChange = false;
    
    const conventionalPatterns = {
      major: /^[a-f0-9]+\s+(.+!):|BREAKING\s+CHANGE/i,
      minor: /^[a-f0-9]+\s+(feat|feature)(\(.+\))?:/i,
      patch: /^[a-f0-9]+\s+(fix|bug|patch|perf|refactor|docs|test|ci|build|chore)(\(.+\))?:/i
    };
    
    for (const commit of commits) {
      if (conventionalPatterns.major.test(commit)) {
        hasMajorChange = true;
        console.log(`🚨 BREAKING: ${commit}`);
      } else if (conventionalPatterns.minor.test(commit)) {
        hasMinorChange = true;
        console.log(`✨ FEATURE: ${commit}`);
      } else if (conventionalPatterns.patch.test(commit)) {
        hasPatchChange = true;
        console.log(`🔧 PATCH: ${commit}`);
      } else {
        console.log(`📝 OTHER: ${commit}`);
        // Non-conventional commits still count as patch changes
        hasPatchChange = true;
      }
    }
    
    if (hasMajorChange) return { type: 'major', commits };
    if (hasMinorChange) return { type: 'minor', commits };
    if (hasPatchChange) return { type: 'patch', commits };
    
    return { type: 'none', commits };
    
  } catch (error) {
    console.error('❌ Error analyzing commits:', error.message);
    return { type: 'patch', commits: [] }; // Default to patch on error
  }
}

// Update version in package.json
function updatePackageVersion(newVersion) {
  const packagePath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageJson.version;
  
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`📦 Updated package.json: ${oldVersion} → ${newVersion}`);
  return oldVersion;
}

// Update CHANGELOG.md
function updateChangelog(newVersion, oldVersion, analysis) {
  const changelogPath = './CHANGELOG.md';
  let changelog = '';
  
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const versionHeader = `## [${newVersion}] - ${today}`;
  
  // Categorize commits
  const categories = {
    breaking: [],
    added: [],
    changed: [],
    fixed: [],
    other: []
  };
  
  for (const commit of analysis.commits) {
    const message = commit.replace(/^[a-f0-9]+\s+/, '');
    
    if (/^(.+!):|BREAKING\s+CHANGE/i.test(message)) {
      categories.breaking.push(message);
    } else if (/^(feat|feature)(\(.+\))?:/i.test(message)) {
      categories.added.push(message);
    } else if (/^(fix|bug)(\(.+\))?:/i.test(message)) {
      categories.fixed.push(message);
    } else if (/^(perf|refactor|docs|test|ci|build|chore)(\(.+\))?:/i.test(message)) {
      categories.changed.push(message);
    } else {
      categories.other.push(message);
    }
  }
  
  // Build changelog entry
  let entry = `\\n${versionHeader}\\n`;
  
  if (categories.breaking.length > 0) {
    entry += '\\n### ⚠️  BREAKING CHANGES\\n';
    categories.breaking.forEach(msg => entry += `- ${msg}\\n`);
  }
  
  if (categories.added.length > 0) {
    entry += '\\n### ✨ Added\\n';
    categories.added.forEach(msg => entry += `- ${msg}\\n`);
  }
  
  if (categories.fixed.length > 0) {
    entry += '\\n### 🐛 Fixed\\n';
    categories.fixed.forEach(msg => entry += `- ${msg}\\n`);
  }
  
  if (categories.changed.length > 0 || categories.other.length > 0) {
    entry += '\\n### 🔧 Changed\\n';
    categories.changed.forEach(msg => entry += `- ${msg}\\n`);
    categories.other.forEach(msg => entry += `- ${msg}\\n`);
  }
  
  // Insert new entry after the header
  const lines = changelog.split('\\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
  lines.splice(insertIndex, 0, ...entry.split('\\n'));
  
  fs.writeFileSync(changelogPath, lines.join('\\n'));
  console.log(`📝 Updated CHANGELOG.md with version ${newVersion}`);
}

// Create git tag
function createTag(version, analysis) {
  try {
    const tagMessage = `Release v${version}\\n\\nChanges in this release:\\n${analysis.commits.slice(0, 5).map(c => `• ${c}`).join('\\n')}${analysis.commits.length > 5 ? `\\n• ... and ${analysis.commits.length - 5} more commits` : ''}`;
    
    execSync(`git tag -a v${version} -m "${tagMessage}"`);
    console.log(`🏷️  Created git tag: v${version}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to create git tag: ${error.message}`);
    return false;
  }
}

// Main version bump logic
function main() {
  console.log('🔍 Analyzing commits for semantic version bump...');
  
  // Check if we're in a git repository
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Not in a git repository');
    process.exit(1);
  }
  
  // Check for uncommitted changes
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.error('❌ Working directory has uncommitted changes. Please commit or stash them first.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to check git status');
    process.exit(1);
  }
  
  // Read current version
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const currentVersion = parseVersion(packageJson.version);
  
  console.log(`📦 Current version: ${formatVersion(currentVersion)}`);
  
  // Analyze commits
  const analysis = analyzeCommits();
  
  if (analysis.type === 'none') {
    console.log('✅ No version bump needed - no relevant commits found');
    process.exit(0);
  }
  
  // Calculate new version
  const newVersion = { ...currentVersion };
  
  switch (analysis.type) {
    case 'major':
      newVersion.major++;
      newVersion.minor = 0;
      newVersion.patch = 0;
      newVersion.prerelease = null;
      break;
    case 'minor':
      newVersion.minor++;
      newVersion.patch = 0;
      newVersion.prerelease = null;
      break;
    case 'patch':
      newVersion.patch++;
      newVersion.prerelease = null;
      break;
  }
  
  const newVersionString = formatVersion(newVersion);
  const oldVersionString = formatVersion(currentVersion);
  
  console.log(`🚀 Version bump: ${oldVersionString} → ${newVersionString} (${analysis.type.toUpperCase()})`);
  
  // Perform updates
  updatePackageVersion(newVersionString);
  updateChangelog(newVersionString, oldVersionString, analysis);
  
  // Stage the changes
  try {
    execSync('git add package.json CHANGELOG.md');
    console.log('📝 Staged version bump changes');
  } catch (error) {
    console.error('❌ Failed to stage changes:', error.message);
  }
  
  // Create commit
  try {
    const commitMessage = `chore(release): bump version to ${newVersionString}

${analysis.type.toUpperCase()} release with ${analysis.commits.length} commits

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    execSync(`git commit -m "${commitMessage}"`);
    console.log('✅ Created version bump commit');
  } catch (error) {
    console.error('❌ Failed to create commit:', error.message);
    process.exit(1);
  }
  
  // Create tag
  if (createTag(newVersionString, analysis)) {
    console.log('🎉 Version bump complete!');
    console.log(`📋 Next steps:`);
    console.log(`   git push origin main`);
    console.log(`   git push origin v${newVersionString}`);
  } else {
    console.log('⚠️  Version bump complete, but tag creation failed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseVersion, formatVersion, analyzeCommits };