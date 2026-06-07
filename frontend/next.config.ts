import type { NextConfig } from "next";

const isGithubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "gh-pages";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? "/CareerpilotAI-" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


