import type { APIRoute } from 'astro';
import { getRuntimeSiteUrl } from '../../../utils/site-url.ts';

export const GET: APIRoute = async ({ site }) => {
  // Use runtime URL detection to ensure correct preview URLs
  // Fallback to Astro site config if runtime detection fails
  const baseUrl = getRuntimeSiteUrl() || site?.toString().replace(/\/$/, '') || 'http://localhost:4321';
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${baseUrl}/pdf-print`
    }
  });
};