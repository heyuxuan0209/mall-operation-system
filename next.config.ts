import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用生产环境的Source Maps，保护源代码
  productionBrowserSourceMaps: false,

  // 编译器优化
  compiler: {
    // 生产环境移除console.log
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 输出优化
  poweredByHeader: false, // 移除X-Powered-By header
};

export default nextConfig;
