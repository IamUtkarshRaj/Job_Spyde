import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker deployment — produces a standalone build
  output: "standalone",

  // Proxy /api/agent/* requests to the agent service
  // In Docker, 'agent' resolves via Docker DNS; locally use 127.0.0.1:8000
  async rewrites() {
    const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/agent/:path*",
        destination: `${agentUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
