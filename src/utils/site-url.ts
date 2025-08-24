/**
 * Runtime URL detection utility for API routes
 * Uses the same priority logic as astro.config.mjs but for runtime
 */
export function getRuntimeSiteUrl(): string {
  // PRIORITY 1: Explicit DEPLOY_URL from workflow (Preview deployments)
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }
  
  // PRIORITY 2: Netlify Deploy Preview URL detection
  // For deploy previews, DEPLOY_PRIME_URL contains branch-based URL but actual access is via deploy-preview-XX
  if (process.env.CONTEXT === 'deploy-preview' && process.env.REVIEW_ID) {
    return `https://deploy-preview-${process.env.REVIEW_ID}--resume-as-code.netlify.app`;
  }
  
  // PRIORITY 3: Netlify environment URLs 
  if (process.env.DEPLOY_PRIME_URL && process.env.DEPLOY_PRIME_URL !== 'undefined') {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  if (process.env.NETLIFY_URL && process.env.NETLIFY_URL !== 'undefined') {
    return process.env.NETLIFY_URL;
  }
  
  // PRIORITY 4: Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    return 'https://rafilkmp3.github.io/resume-as-code';
  }
  
  // PRIORITY 5: Local development fallback
  return 'http://localhost:4321';
}