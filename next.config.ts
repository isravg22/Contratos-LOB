import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : "standalone",
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["pdfkit"],
  basePath: isGithubPages ? "/Contratos-LOB" : "",
  assetPrefix: isGithubPages ? "/Contratos-LOB/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
