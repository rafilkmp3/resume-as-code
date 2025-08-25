// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import partytown from '@astrojs/partytown';

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
  srcDir: './app', // Use app/ instead of src/
  outDir: './workspace/build', // Output to workspace
  site: site,
  output: 'static', // Ensure static output for all deployment targets
  trailingSlash: 'ignore', // Handle both with/without trailing slash
  build: {
    format: 'directory', // Create clean URLs
    // CSS optimization to prevent render-blocking (Context7 best practices)
    inlineStylesheets: 'always', // Always inline CSS to prevent render-blocking for LCP optimization
    assets: '_astro' // Consistent asset directory for better caching
  },
  // Performance optimization for LCP improvement  
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize CSS delivery
      cssCodeSplit: true, // Split CSS by entry points for better caching
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB (balance performance vs cache)
      rollupOptions: {
        output: {
          // Ensure consistent asset naming for better caching
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      }
    }
  },
  integrations: [
    icon(),
    sitemap({
      customPages: [
        // Main sections with anchor links for better SEO indexing
        `${site}/#header`,
        `${site}/#connect`, 
        `${site}/#experience`,
        `${site}/#projects`,
        `${site}/#certifications`,
        `${site}/#skills`,
      ],
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: new Date(),
    }),
    compress({
      CSS: true,
      HTML: {
        removeComments: false // Keep comments for debugging
      },
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
    partytown({
      config: {
        forward: ['gtag', 'dataLayer.push'],
      },
    })
  ]
});