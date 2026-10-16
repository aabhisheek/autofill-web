/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Type errors are still surfaced by `npm run typecheck`; lint is not a build gate.
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
