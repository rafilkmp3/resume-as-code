import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  // Use Astro's build-time configured site URL
  // This is set in astro.config.mjs based on deployment environment
  const baseUrl = site?.toString().replace(/\/$/, '') || 'http://localhost:4321';
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${baseUrl}/pdf-ats`
    }
  });
};