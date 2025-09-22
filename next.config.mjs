import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: process.env.BASEPATH,
  // redirects: async () => {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/home',
  //       permanent: true,
  //       locale: false
  //     }
  //   ]
  // }
  eslint: { ignoreDuringBuilds: true },
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@core': path.resolve(__dirname, 'src/@core'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@redux-store': path.resolve(__dirname, 'src/redux-store')
    }

    return config
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ],

    domains: ['i.postimg.cc']
  }
}

export default nextConfig
