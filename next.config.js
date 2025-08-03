/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
}

// Only add export and GitHub paths for production builds
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
  nextConfig.distDir = 'dist';
  
  if (process.env.GITHUB_ACTIONS === 'true') {
    nextConfig.assetPrefix = '/resume-as-code/';
    nextConfig.basePath = '/resume-as-code';
  }
}

module.exports = nextConfig