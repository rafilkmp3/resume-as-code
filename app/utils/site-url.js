/**
 * Get the correct site URL for the current environment
 * Simple, clear logic for build-time environment injection
 */
export function getSiteUrl() {
  // Preview deployments have priority (Netlify Deploy Previews)
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  // Staging environment (Netlify)
  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL;
  }
  
  // Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES || process.env.CI) {
    return 'https://rafilkmp3.github.io/resume-as-code';
  }
  
  // Local development fallback
  return 'http://localhost:4321';
}