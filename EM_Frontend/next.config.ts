import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Without this, the stray
    // package-lock.json in ~/Desktop makes Next infer the entire Desktop
    // folder as the root, so Turbopack tries to crawl/watch tens of GB and
    // the first request hangs forever (white screen).
    root: path.join(__dirname),
  },
};

export default nextConfig;
