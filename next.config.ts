import type { NextConfig } from "next";
import { legacyDemoRedirects } from "./src/config/routes";

const nextConfig: NextConfig = {
  redirects: async () => legacyDemoRedirects,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
