/**
 * Runtime URL detection utility for API routes
 * Uses the same priority logic as astro.config.mjs but for runtime
 */
export function getRuntimeSiteUrl(): string {
  // PRIORITY 1: Explicit DEPLOY_URL from workflow (Preview deployments)
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }
  
  // PRIORITY 2: Netlify environment URLs 
  if (process.env.DEPLOY_PRIME_URL && process.env.DEPLOY_PRIME_URL !== 'undefined') {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  if (process.env.NETLIFY_URL && process.env.NETLIFY_URL !== 'undefined') {
    return process.env.NETLIFY_URL;
  }
  
  // PRIORITY 3: Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    return 'https://rafilkmp3.github.io/resume-as-code';
  }
  
  // PRIORITY 4: Local development fallback
  return 'http://localhost:4321';
}