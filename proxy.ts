import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 访问码验证代理函数
export default function proxy(request: NextRequest) {
  const ACCESS_CODE = process.env.ACCESS_CODE || 'demo2026';
  const ACCESS_PAGE = '/access-verify';
  const { pathname } = request.nextUrl;

  // 排除：访问码页面、静态资源、API、landing page
  if (
    pathname === ACCESS_PAGE ||
    pathname === '/landing.html' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|html)$/)
  ) {
    return NextResponse.next();
  }

  // 检查 cookie 中的访问码
  const accessToken = request.cookies.get('access_verified')?.value;
  if (accessToken === ACCESS_CODE) {
    return NextResponse.next();
  }

  // 未验证，重定向到访问码输入页面
  const url = request.nextUrl.clone();
  url.pathname = ACCESS_PAGE;
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
