import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

function getGitInfo() {
  try {
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const lastCommitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    
    return {
      shortHash,
      branch,
      lastCommitDate,
      lastCommitMessage
    };
  } catch (error) {
    return {
      shortHash: 'unknown',
      branch: 'unknown',
      lastCommitDate: new Date().toISOString(),
      lastCommitMessage: 'unknown'
    };
  }
}

export const GET: APIRoute = async ({ site }) => {
  const gitInfo = getGitInfo();
  const siteUrl = site?.toString().replace(/\/$/, '') || 'http://localhost:4321';
  
  // Simple text format for backward compatibility
  const versionText = `${gitInfo.shortHash} (${gitInfo.branch})
Built: ${new Date().toISOString()}
Site: ${siteUrl}
Commit: ${gitInfo.lastCommitMessage}
Generated: API endpoint (/api/version for JSON)`;

  return new Response(versionText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};