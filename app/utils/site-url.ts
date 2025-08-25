/**
 * Runtime URL detection utility optimized for GitHub Actions + Netlify static deployment
 * PRIORITY: GitHub Actions workflow env vars > Netlify runtime detection > fallbacks
 */
export function getRuntimeSiteUrl(): string {
  // PRIORITY 1: GitHub Actions workflow DEPLOY_URL (set by our PR Preview workflow)
  // This is the most reliable since we build everything on GitHub Actions
  if (process.env.DEPLOY_URL && process.env.DEPLOY_URL.startsWith('https://')) {
    return process.env.DEPLOY_URL;
  }
  
  // PRIORITY 2: Netlify Deploy Preview URL detection (fallback)
  // Only use this if GitHub Actions didn't set DEPLOY_URL
  if (process.env.CONTEXT === 'deploy-preview' && process.env.REVIEW_ID) {
    const previewUrl = `https://deploy-preview-${process.env.REVIEW_ID}--resume-as-code.netlify.app`;
    return previewUrl;
  }
  
  // PRIORITY 3: Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    return 'https://rafilkmp3.github.io/resume-as-code';
  }
  
  // PRIORITY 4: Netlify production (fallback for staging)
  if (process.env.NETLIFY_URL && process.env.NETLIFY_URL !== 'undefined') {
    return process.env.NETLIFY_URL;
  }
  
  // PRIORITY 5: Local development fallback
  return 'http://localhost:4321';
}