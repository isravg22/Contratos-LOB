import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // Next 16.3 currently fails when Vercel's build adapter and standalone
  // output are enabled together. Vercel does not consume the standalone bundle.
  output: isGithubPages ? "export" : isVercel ? undefined : "standalone",
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["pdfkit"],
  basePath: isGithubPages ? "/Contratos-LOB" : "",
  assetPrefix: isGithubPages ? "/Contratos-LOB/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
