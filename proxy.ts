import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 访问码验证 Middleware
export default function middleware(request: NextRequest) {
  // 获取配置的访问码（从环境变量）
  const ACCESS_CODE = process.env.ACCESS_CODE || 'demo2026';

  // 访问码验证页面路径
  const ACCESS_PAGE = '/access-verify';

  // 当前请求路径
  const { pathname } = request.nextUrl;

  // 排除：访问码页面本身、Next.js 内部路径、API 路由、静态资源（含 .html）
  if (
    pathname === ACCESS_PAGE ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|html)$/)
  ) {
    return NextResponse.next();
  }

  // 检查 cookie 中的访问码
  const accessToken = request.cookies.get('access_verified')?.value;

  // 验证访问码
  if (accessToken === ACCESS_CODE) {
    return NextResponse.next();
  }

  // 未验证：根路径 "/" 重定向到 landing page，其他路径跳到验证页
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/landing.html';
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = ACCESS_PAGE;
  url.searchParams.set('redirect', pathname);

  return NextResponse.redirect(url);
}

// 配置需要保护的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
