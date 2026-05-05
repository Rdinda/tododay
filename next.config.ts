import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['better-sqlite3'],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    TODODAY_ACCESS_PASSCODE: process.env.TODODAY_ACCESS_PASSCODE,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
