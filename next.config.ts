import type { NextConfig } from "next";
import { legacyDemoRedirects } from "./src/config/routes";
import { profileAssets } from "./src/config/profile";

const nextConfig: NextConfig = {
  images: {
    // Only the five owner-selected public files; no generic storage proxy.
    remotePatterns: Object.values(profileAssets).map((url) => new URL(url)),
  },
  redirects: async () => legacyDemoRedirects,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Tailwind transforms only the global entry. Applying this to .module.css
      // renames those files to global CSS and drops their class-name exports.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
