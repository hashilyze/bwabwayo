// next.config.js
const nextConfig = {
    // 프로덕션 환경에서만 basePath 적용
    basePath: process.env.NODE_ENV === 'production' ? '/fe' : '',
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