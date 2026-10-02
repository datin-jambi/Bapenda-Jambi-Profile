import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imagekit-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Bookmark & PWA lama masih menunjuk /cms — arahkan ke branding baru.
  async redirects() {
    return [
      { source: "/cms", destination: "/seloko", permanent: true },
      { source: "/cms/:path*", destination: "/seloko/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
