// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

/**
 * Clean build-time URL configuration for all deployment environments
 */
function getSiteUrl() {
  console.log('🔍 Environment debug:');
  console.log('  DEPLOY_URL:', process.env.DEPLOY_URL);
  console.log('  NETLIFY_URL:', process.env.NETLIFY_URL);
  console.log('  DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL);
  console.log('  GITHUB_PAGES:', process.env.GITHUB_PAGES);
  console.log('  CONTEXT:', process.env.CONTEXT);
  console.log('  REVIEW_ID:', process.env.REVIEW_ID);
  
  // PRIORITY 1: Explicit DEPLOY_URL from workflow (Preview deployments)
  if (process.env.DEPLOY_URL) {
    console.log('✅ Using DEPLOY_URL:', process.env.DEPLOY_URL);
    return process.env.DEPLOY_URL;
  }
  
  // PRIORITY 2: Netlify environment URLs 
  if (process.env.DEPLOY_PRIME_URL) {
    console.log('✅ Using DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL);
    return process.env.DEPLOY_PRIME_URL;
  }
  
  if (process.env.NETLIFY_URL) {
    console.log('✅ Using NETLIFY_URL:', process.env.NETLIFY_URL);
    return process.env.NETLIFY_URL;
  }
  
  // PRIORITY 3: Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    const prodUrl = 'https://rafilkmp3.github.io/resume-as-code';
    console.log('✅ Using Production URL:', prodUrl);
    return prodUrl;
  }
  
  // PRIORITY 4: Local development fallback
  const localUrl = 'http://localhost:4321';
  console.log('✅ Using Local Development URL:', localUrl);
  return localUrl;
}

const site = getSiteUrl();

// https://astro.build/config
export default defineConfig({
  site: site,
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