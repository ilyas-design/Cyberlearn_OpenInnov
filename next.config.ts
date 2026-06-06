import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from resolving deps via the parent lockfile (C:\Users\ilyas\package-lock.json)
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
