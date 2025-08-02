import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-abf9b5e8094d460d95b3c36437f767c0.r2.dev",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
