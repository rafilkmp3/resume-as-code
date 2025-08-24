/**
 * Runtime URL detection utility for API routes
 * PRIMARY: Uses CONTEXT + REVIEW_ID for deploy previews (Netlify CLI overrides DEPLOY_URL)
 */
export function getRuntimeSiteUrl(): string {
  // PRIORITY 1: Netlify Deploy Preview URL detection (MOST RELIABLE)
  // Netlify CLI overrides DEPLOY_URL, so use CONTEXT + REVIEW_ID directly
  if (process.env.CONTEXT === 'deploy-preview' && process.env.REVIEW_ID) {
    const previewUrl = `https://deploy-preview-${process.env.REVIEW_ID}--resume-as-code.netlify.app`;
    return previewUrl;
  }
  
  // PRIORITY 2: Explicit DEPLOY_URL from workflow (if not overridden by Netlify CLI)
  if (process.env.DEPLOY_URL && !process.env.DEPLOY_URL.includes('0--resume-as-code')) {
    return process.env.DEPLOY_URL;
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