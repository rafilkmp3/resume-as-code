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
  console.log('DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL);
  console.log('NETLIFY_URL:', process.env.NETLIFY_URL);
  console.log('CONTEXT:', process.env.CONTEXT);
  console.log('HEAD:', process.env.HEAD);
  console.log('BRANCH:', process.env.BRANCH);
  console.log('GITHUB_PAGES:', process.env.GITHUB_PAGES);
  console.log('CI:', process.env.CI);
  
  // Preview deployments (Netlify Deploy Previews)
  if (process.env.DEPLOY_PRIME_URL) {
    console.log('✅ Using DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL);
    return process.env.DEPLOY_PRIME_URL;
  }
  
  // Branch deployments (Netlify branch deploys)
  if (process.env.NETLIFY_URL) {
    console.log('✅ Using NETLIFY_URL:', process.env.NETLIFY_URL);
    return process.env.NETLIFY_URL;
  }
  
  // Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES || (process.env.CI && !process.env.NETLIFY_URL)) {
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