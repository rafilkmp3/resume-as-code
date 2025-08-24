import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

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

export const GET: APIRoute = async ({ site }) => {
  const now = new Date();
  const gitInfo = getGitInfo();
  const envInfo = getEnvironmentInfo();
  
  // Use build-time site URL from Astro config (consistent with PDF routes and QR codes)
  const siteUrl = site?.toString().replace(/\/$/, '') || 'http://localhost:4321';
  
  // Generate cache busting version based on commit hash and timestamp
  const cacheVersion = `${gitInfo.shortHash}-${Date.now()}`;
  
  const versionInfo = {
    // Runtime metadata
    requestTime: now.toISOString(),
    requestTimestamp: now.getTime(),
    cacheVersion,
    
    // Git information (build-time or runtime if available)
    git: gitInfo,
    
    // Environment information
    environment: envInfo,
    
    // Site URL (build-time configuration)
    siteUrl,
    
    // Version for long TTL static assets
    staticAssetsVersion: gitInfo.shortHash,
    
    // Human readable version
    version: `${gitInfo.shortHash} (${gitInfo.branch})`,
    
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