import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Support uploading PDF files larger than 1MB
    },
  },
};

export default nextConfig;
