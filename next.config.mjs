/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.html': {
        type: 'raw',
      },
    },
  },
}

export default nextConfig
