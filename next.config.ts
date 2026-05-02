import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow external origins in development (local network IP + ngrok tunnels).
  // This only applies when NODE_ENV=development.
  allowedDevOrigins: ['192.168.29.73', '*.ngrok-free.dev', '*.ngrok.io'],
};

export default nextConfig;
