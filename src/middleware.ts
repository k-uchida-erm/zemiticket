import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(_request: NextRequest) {
  // 一時的に認証ガードを無効化（ログインフロー調整のため）
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

