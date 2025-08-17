const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/fe' : '',
  env: {
    NEXT_PUBLIC_PUBLIC_URL: process.env.NODE_ENV === 'production' ? '/fe' : '',
  },
  sassOptions: {
    includePaths: ['./'],
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