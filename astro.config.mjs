// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

/**
 * Get the correct site URL for build-time configuration
 * Handles all deployment environments with proper fallbacks
 */
function getBuildSiteUrl() {
  // Debug environment variables
  console.log('🔍 Build Environment Debug:');
  console.log('DEPLOY_URL:', process.env.DEPLOY_URL);
  console.log('CONTEXT:', process.env.CONTEXT);
  console.log('HEAD:', process.env.HEAD);
  console.log('BRANCH:', process.env.BRANCH);
  console.log('GITHUB_PAGES:', process.env.GITHUB_PAGES);
  console.log('CI:', process.env.CI);
  
  // GitHub Actions Preview deployments (using DEPLOY_URL from workflow)
  if (process.env.DEPLOY_URL) {
    console.log('✅ Using DEPLOY_URL:', process.env.DEPLOY_URL);
    return process.env.DEPLOY_URL;
  }
  
  // TEMPORARY DEBUG: Force correct URL for branch fix/pdf-first-page-layout
  if (process.env.BRANCH === 'fix/pdf-first-page-layout' && process.env.REVIEW_ID === '78') {
    const debugUrl = 'https://deploy-preview-78--resume-as-code.netlify.app';
    console.log('🐛 DEBUG: Force correct URL:', debugUrl);
    return debugUrl;
  }
  
  // Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true' || (process.env.CI && !process.env.DEPLOY_URL)) {
    const prodUrl = 'https://rafilkmp3.github.io/resume-as-code';
    console.log('✅ Using Production URL:', prodUrl);
    return prodUrl;
  }
  
  // Local development fallback
  const localUrl = 'http://localhost:4321';
  console.log('✅ Using Local Development URL:', localUrl);
  return localUrl;
}

const siteUrl = getBuildSiteUrl();
console.log('🚀 Final Site URL:', siteUrl);

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static', // Ensure static output for all deployment targets
  trailingSlash: 'ignore', // Handle both with/without trailing slash
  build: {
    format: 'directory' // Create clean URLs
  },
  integrations: [
    icon()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});