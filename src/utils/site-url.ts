/**
 * Runtime URL detection utility for API routes
 * Uses the same priority logic as astro.config.mjs but for runtime
 */
export function getRuntimeSiteUrl(): string {
  // Debug logging to understand what's happening
  console.log('getRuntimeSiteUrl DEBUG:', {
    DEPLOY_URL: process.env.DEPLOY_URL,
    CONTEXT: process.env.CONTEXT,
    REVIEW_ID: process.env.REVIEW_ID,
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
    NETLIFY_URL: process.env.NETLIFY_URL,
    GITHUB_PAGES: process.env.GITHUB_PAGES
  });

  // PRIORITY 1: Explicit DEPLOY_URL from workflow (Preview deployments)
  if (process.env.DEPLOY_URL) {
    console.log('Using DEPLOY_URL:', process.env.DEPLOY_URL);
    return process.env.DEPLOY_URL;
  }
  
  // PRIORITY 2: Netlify Deploy Preview URL detection
  // For deploy previews, DEPLOY_PRIME_URL contains branch-based URL but actual access is via deploy-preview-XX
  if (process.env.CONTEXT === 'deploy-preview' && process.env.REVIEW_ID) {
    const previewUrl = `https://deploy-preview-${process.env.REVIEW_ID}--resume-as-code.netlify.app`;
    console.log('Using deploy preview URL:', previewUrl);
    return previewUrl;
  }
  
  // PRIORITY 3: Netlify environment URLs 
  if (process.env.DEPLOY_PRIME_URL && process.env.DEPLOY_PRIME_URL !== 'undefined') {
    console.log('Using DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL);
    return process.env.DEPLOY_PRIME_URL;
  }
  
  if (process.env.NETLIFY_URL && process.env.NETLIFY_URL !== 'undefined') {
    console.log('Using NETLIFY_URL:', process.env.NETLIFY_URL);
    return process.env.NETLIFY_URL;
  }
  
  // PRIORITY 4: Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    console.log('Using GitHub Pages URL');
    return 'https://rafilkmp3.github.io/resume-as-code';
  }
  
  // PRIORITY 5: Local development fallback
  console.log('Using local development fallback');
  return 'http://localhost:4321';
}