import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // 获取配置的访问码
    const ACCESS_CODE = process.env.ACCESS_CODE || 'demo2026';

    // 验证访问码
    if (code === ACCESS_CODE) {
      // 创建响应
      const response = NextResponse.json({ success: true });

      // 设置 cookie（30天有效期）
      response.cookies.set('access_verified', code, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30天
        path: '/',
      });

      return response;
    }

    // 访问码错误
    return NextResponse.json(
      { success: false, message: '访问码错误' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '验证失败' },
      { status: 500 }
    );
  }
}
