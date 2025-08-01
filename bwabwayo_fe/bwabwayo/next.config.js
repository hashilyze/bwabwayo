// next.config.js
const nextConfig = {
    // 프로덕션 환경에서만 basePath 적용
    basePath: process.env.NODE_ENV === 'production' ? '/fe' : '',
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