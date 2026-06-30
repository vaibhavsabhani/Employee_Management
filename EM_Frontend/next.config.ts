import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project ONLY in local dev/build. Without
  // this, the stray package-lock.json in ~/Desktop makes Next infer the entire
  // Desktop folder as the root, so Turbopack tries to crawl/watch tens of GB
  // and the first request hangs forever (white screen).
  //
  // On Vercel we must NOT set this: the deploy adapter injects
  // `outputFileTracingRoot` (= the repo root, e.g. /vercel/path0) after this
  // config is evaluated. Setting `turbopack.root` to __dirname would then
  // disagree with it and Next warns "they must have the same value". Vercel
  // already pins the root correctly, so leaving it unset avoids the conflict.
  ...(process.env.VERCEL
    ? {}
    : { turbopack: { root: path.join(__dirname) } }),
};

export default nextConfig;
