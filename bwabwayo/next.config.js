// next.config.js
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/:path*', // dev 백엔드 주소
        },
      ];
    },
  };
  
  module.exports = nextConfig;