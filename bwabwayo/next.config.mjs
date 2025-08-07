const nextConfig = {
  basePath: '',
  env: {
    PUBLIC_URL: process.env.PUBLIC_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bwabwayo-general-bucket.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://localhost:8081/:path*', // dev 백엔드 주소
      },
    ];
  },
};

export default nextConfig;