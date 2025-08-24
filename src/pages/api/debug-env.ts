import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Filter environment variables to only show relevant ones
  const relevantEnvVars = Object.keys(process.env)
    .filter(key => 
      key.includes('DEPLOY') || 
      key.includes('NETLIFY') || 
      key.includes('CONTEXT') || 
      key.includes('REVIEW') || 
      key.includes('PR') ||
      key.includes('GITHUB') ||
      key.includes('BRANCH') ||
      key.includes('HEAD')
    )
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {} as Record<string, string | undefined>);

  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    relevantEnvVars,
    allEnvVarNames: Object.keys(process.env).sort()
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};