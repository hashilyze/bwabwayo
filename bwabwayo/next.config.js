// next.config.js
const nextConfig = {
    basePath: '',
    images: {
      domains: ['bwabwayo-general-bucket.s3.ap-northeast-2.amazonaws.com', 'localhost'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'bwabwayo-general-bucket.s3.ap-northeast-2.amazonaws.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    env: {
      NEXT_PUBLIC_PUBLIC_URL: process.env.PUBLIC_URL || '/fe', // 로컬은 '', 배포는 '/fe'
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
  
  module.exports = nextConfig;