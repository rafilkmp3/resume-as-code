#!/usr/bin/env node

/**
 * Generate version information for deployment tracking and efficient caching
 * Creates version.json with build info for easy tracking of deployments
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const lastCommitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    
    return {
      hash: commitHash,
      shortHash,
      branch,
      lastCommitDate,
      lastCommitMessage
    };
  } catch (error) {
    console.warn('⚠️  Warning: Could not retrieve Git information:', error.message);
    return {
      hash: 'unknown',
      shortHash: 'unknown',
      branch: 'unknown',
      lastCommitDate: new Date().toISOString(),
      lastCommitMessage: 'unknown'
    };
  }
}

function getEnvironmentInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    deployPrimeUrl: process.env.DEPLOY_PRIME_URL,
    netlifyUrl: process.env.NETLIFY_URL,
    isCI: !!process.env.CI,
    isNetlify: !!process.env.NETLIFY,
    context: process.env.CONTEXT || 'unknown',
    head: process.env.HEAD || 'unknown',
    reviewId: process.env.REVIEW_ID
  };
}

function generateVersionInfo() {
  const now = new Date();
  const gitInfo = getGitInfo();
  const envInfo = getEnvironmentInfo();
  
  // Generate cache busting version based on commit hash and timestamp
  const cacheVersion = `${gitInfo.shortHash}-${Date.now()}`;
  
  const versionInfo = {
    // Build metadata
    buildTime: now.toISOString(),
    buildTimestamp: now.getTime(),
    cacheVersion,
    
    // Git information
    git: gitInfo,
    
    // Environment information
    environment: envInfo,
    
    // Site URL detection (same logic as build)
    siteUrl: envInfo.deployPrimeUrl || envInfo.netlifyUrl || 
             (envInfo.isCI ? 'https://rafilkmp3.github.io/resume-as-code' : 'http://localhost:4321'),
    
    // Version for long TTL static assets
    staticAssetsVersion: gitInfo.shortHash,
    
    // Human readable version
    version: `${gitInfo.shortHash} (${gitInfo.branch})`
  };

  return versionInfo;
}

function writeVersionFiles(versionInfo) {
  const distDir = path.join(__dirname, '..', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure directories exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const versionJson = JSON.stringify(versionInfo, null, 2);
  
  // Write to dist directory (for build output)
  fs.writeFileSync(path.join(distDir, 'version.json'), versionJson);
  
  // Write to public directory (for static serving)
  fs.writeFileSync(path.join(publicDir, 'version.json'), versionJson);
  
  // Also create a simple text file for easy checking
  const versionText = `${versionInfo.version}\nBuilt: ${versionInfo.buildTime}\nSite: ${versionInfo.siteUrl}\nCommit: ${versionInfo.git.lastCommitMessage}`;
  fs.writeFileSync(path.join(distDir, 'version.txt'), versionText);
  fs.writeFileSync(path.join(publicDir, 'version.txt'), versionText);
  
  console.log('✅ Version files generated:');
  console.log(`   📦 Version: ${versionInfo.version}`);
  console.log(`   🌐 Site URL: ${versionInfo.siteUrl}`);
  console.log(`   ⚡ Cache Version: ${versionInfo.cacheVersion}`);
  console.log(`   📁 Files: dist/version.json, public/version.json, dist/version.txt, public/version.txt`);
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const versionInfo = generateVersionInfo();
  writeVersionFiles(versionInfo);
}

export { generateVersionInfo, writeVersionFiles };