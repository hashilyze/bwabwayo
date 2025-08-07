// next.config.js
const nextConfig = {
    // basePath 설정
    // 로컬 사용은 ''
    // 배포 시 '/fe'
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