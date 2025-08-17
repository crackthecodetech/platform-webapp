import type { NextConfig } from "next";

import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ["lucide-react"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.crackthecode.tech",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "pub-abf9b5e8094d460d95b3c36437f767c0.r2.dev",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "pub-0df6607b77ef4e97a71b56c8a99de9d9.r2.dev",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default bundleAnalyzer(nextConfig);
