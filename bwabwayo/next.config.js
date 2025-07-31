// next.config.js
const nextConfig = {
    basePath: '/fe',
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