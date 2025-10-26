// next.config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: process.env.BASEPATH,
  // redirects: async () => [
  //   { source: '/', destination: '/home', permanent: true, locale: false }
  // ],
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
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
    domains: ['i.postimg.cc']
  }
}

export default nextConfig

// // next.config.mjs
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // basePath: process.env.BASEPATH,
//   // redirects: async () => [
//   //   { source: '/', destination: '/home', permanent: true, locale: false }
//   // ],
//   eslint: { ignoreDuringBuilds: true },

//   webpack: (config, { isServer }) => {
//     config.resolve.alias = {
//       ...(config.resolve.alias || {}),
//       '@': path.resolve(__dirname, 'src'),
//       '@components': path.resolve(__dirname, 'src/components'),
//       '@core': path.resolve(__dirname, 'src/@core'),
//       '@assets': path.resolve(__dirname, 'src/assets'),
//       '@redux-store': path.resolve(__dirname, 'src/redux-store')
//     }

//     // Add fallback for client-side to ignore Node.js modules
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         child_process: false,
//         fs: false,
//         net: false,
//         tls: false,
//         'mongodb-client-encryption': false
//       }
//     }

//     return config
//   },

//   images: {
//     remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
//     domains: ['i.postimg.cc']
//   }
// }

// export default nextConfig
