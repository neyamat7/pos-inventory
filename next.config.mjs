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
