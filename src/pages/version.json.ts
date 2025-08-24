import type { APIRoute } from 'astro';

// Redirect to new API endpoint for backward compatibility
export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/api/version'
    }
  });
};