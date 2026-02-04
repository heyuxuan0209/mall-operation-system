import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 访问码验证代理函数
export default function proxy(request: NextRequest) {
  // 获取配置的访问码（从环境变量）
  const ACCESS_CODE = process.env.ACCESS_CODE || 'demo2026';

  // 访问码验证页面路径
  const ACCESS_PAGE = '/access-verify';

  // 当前请求路径
  const { pathname } = request.nextUrl;

  // 排除访问码验证页面本身和静态资源
  if (
    pathname === ACCESS_PAGE ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 检查 cookie 中的访问码
  const accessToken = request.cookies.get('access_verified')?.value;

  // 验证访问码
  if (accessToken === ACCESS_CODE) {
    return NextResponse.next();
  }

  // 未验证，重定向到访问码输入页面
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
