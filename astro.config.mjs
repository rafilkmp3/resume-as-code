// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

/**
 * Clean build-time URL configuration for all deployment environments
 */
function getSiteUrl() {
  // Preview deployments (GitHub Actions → Netlify)
  if (process.env.DEPLOY_URL) {
    console.log('🚀 Preview deployment:', process.env.DEPLOY_URL);
    return process.env.DEPLOY_URL;
  }
  
  // Production environment (GitHub Pages)
  if (process.env.GITHUB_PAGES === 'true') {
    const prodUrl = 'https://rafilkmp3.github.io/resume-as-code';
    console.log('🚀 Production deployment:', prodUrl);
    return prodUrl;
  }
  
  // Local development
  const localUrl = 'http://localhost:4321';
  console.log('🚀 Local development:', localUrl);
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