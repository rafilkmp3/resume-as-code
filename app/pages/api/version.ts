import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import { getRuntimeSiteUrl } from '../../utils/site-url.ts';

function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const lastCommitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    
    // Get commit counts for different environments
    let commitsAheadOfMain = 0;
    let commitsAheadOfLatestRelease = 0;
    let latestReleaseTag = null;
    let latestReleaseDate = null;
    
    try {
      // Get latest release tag
      latestReleaseTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      latestReleaseDate = execSync(`git log -1 --format=%ci ${latestReleaseTag}`, { encoding: 'utf8' }).trim();
      
      // Count commits ahead of latest release (for production info)
      commitsAheadOfLatestRelease = parseInt(
        execSync(`git rev-list --count ${latestReleaseTag}..HEAD`, { encoding: 'utf8' }).trim()
      );
    } catch (e) {
      // No releases yet or git describe failed
      latestReleaseTag = 'v0.0.0';
      latestReleaseDate = 'No releases yet';
    }
    
    try {
      // Count commits ahead of main (for preview environment)
      commitsAheadOfMain = parseInt(
        execSync('git rev-list --count main..HEAD', { encoding: 'utf8' }).trim()
      );
    } catch (e) {
      // Not on a branch ahead of main, or main doesn't exist
      commitsAheadOfMain = 0;
    }
    
    return {
      hash: commitHash,
      shortHash,
      branch,
      lastCommitDate,
      lastCommitMessage,
      commitsAheadOfMain,
      commitsAheadOfLatestRelease,
      latestRelease: {
        tag: latestReleaseTag,
        date: latestReleaseDate,
        url: `https://github.com/rafilkmp3/resume-as-code/releases/tag/${latestReleaseTag}`
      }
    };
  } catch (error) {
    return {
      hash: 'unknown',
      shortHash: 'unknown', 
      branch: 'unknown',
      lastCommitDate: new Date().toISOString(),
      lastCommitMessage: 'unknown',
      commitsAheadOfMain: 0,
      commitsAheadOfLatestRelease: 0,
      latestRelease: {
        tag: 'unknown',
        date: 'unknown',
        url: 'https://github.com/rafilkmp3/resume-as-code/releases'
      }
    };
  }
}

function generateSemanticVersion(gitInfo, envInfo) {
  // Ultra-simple semantic version generation - no complex logic
  const baseVersion = gitInfo.latestRelease.tag || 'v0.0.0';
  
  // Use environment context to determine suffix
  const context = envInfo.context || 'unknown';
  const reviewId = envInfo.reviewId;
  
  // Simple mapping: context -> version format
  const versionMap = {
    'production': baseVersion, // Production = clean version
    'deploy-preview': reviewId ? `${baseVersion}-preview.${reviewId}` : `${baseVersion}-preview.${gitInfo.shortHash}`,
    'staging': gitInfo.commitsAheadOfLatestRelease > 0 ? `${baseVersion}+${gitInfo.commitsAheadOfLatestRelease}` : baseVersion,
    'development': `${baseVersion}-dev.${gitInfo.shortHash}`
  };
  
  // Return mapped version or fallback
  return versionMap[context] || `${baseVersion}-${gitInfo.shortHash}`;
}

function getEnvironmentInfo() {
  // Determine environment type based on context
  let environmentType = 'unknown';
  let environmentName = 'unknown';
  
  if (process.env.GITHUB_PAGES === 'true') {
    environmentType = 'production';
    environmentName = 'GitHub Pages';
  } else if (process.env.NETLIFY === 'true') {
    if (process.env.CONTEXT === 'production' || process.env.CONTEXT === 'staging') {
      environmentType = 'staging';
      environmentName = 'Netlify Staging';
    } else if (process.env.CONTEXT === 'deploy-preview') {
      environmentType = 'preview';
      environmentName = 'Netlify Preview';
    } else {
      environmentType = 'development';
      environmentName = 'Netlify Development';
    }
  } else {
    environmentType = 'local';
    environmentName = 'Local Development';
  }
  
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    // Deprecated deployPrimeUrl - use siteUrl instead for consistency
    deployUrl: getRuntimeSiteUrl(), // Single, reliable URL detection
    isCI: !!process.env.CI,
    isNetlify: !!process.env.NETLIFY,
    context: process.env.CONTEXT || 'unknown',
    head: process.env.HEAD || 'unknown',
    reviewId: process.env.REVIEW_ID,
    // Enhanced environment classification
    environmentType,
    environmentName
  };
}

export const GET: APIRoute = async ({ site }) => {
  const now = new Date();
  const gitInfo = getGitInfo();
  const envInfo = getEnvironmentInfo();
  
  // Use single consistent URL detection - no more confusing multiple URL fields
  const siteUrl = getRuntimeSiteUrl();
  
  // Generate semantic version based on environment and git info
  const semanticVersion = generateSemanticVersion(gitInfo, envInfo);
  
  // Generate cache busting version based on commit hash and timestamp
  const cacheVersion = `${gitInfo.shortHash}-${Date.now()}`;
  
  // Simple environment version info - no complex branching
  const environmentVersionInfo = {
    type: envInfo.environmentType,
    description: `${envInfo.environmentName} - ${semanticVersion}`,
    semanticVersion: semanticVersion,
    commitsAhead: envInfo.context === 'deploy-preview' ? gitInfo.commitsAheadOfMain : gitInfo.commitsAheadOfLatestRelease,
    baseBranch: envInfo.context === 'deploy-preview' ? 'main' : gitInfo.latestRelease.tag
  };

  const versionInfo = {
    // Runtime metadata
    requestTime: now.toISOString(),
    requestTimestamp: now.getTime(),
    cacheVersion,
    
    // Git information (build-time or runtime if available)
    git: gitInfo,
    
    // Environment information
    environment: envInfo,
    
    // Environment-specific version counter (as requested by user)
    environmentVersion: environmentVersionInfo,
    
    // Site URL (build-time configuration)
    siteUrl,
    
    // Version for long TTL static assets
    staticAssetsVersion: gitInfo.shortHash,
    
    // Human readable version - semantic when possible, fallback to git hash
    version: semanticVersion,
    
    // Technical version info
    gitVersion: `${gitInfo.shortHash} (${gitInfo.branch})`,
    
    // API metadata
    api: {
      endpoint: '/api/version',
      generated: 'dynamically',
      cacheControl: 'no-cache'
    }
  };

  return new Response(JSON.stringify(versionInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};