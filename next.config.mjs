/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    webpack: (config) => {
        config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
        return config;
    },
};

export default nextConfig;
