/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    // Next.js 16 uses Turbopack by default - add empty config to acknowledge
    turbopack: {},
};

export default nextConfig;
