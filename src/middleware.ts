import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = new Set<string>(['/auth/login', '/auth/callback', '/api/supabase-health', '/favicon.ico']);

type CookieSetOptions = {
  domain?: string;
  expires?: Date | number;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
};

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies: reqCookies } = req;
  const pathname = nextUrl.pathname;

  if ([...PUBLIC_PATHS].some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string): string | undefined {
          return reqCookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieSetOptions = {}): void {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieSetOptions = {}): void {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const hasSession = !!data.session;

  if (!hasSession) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|static|.*\..*).*)'],
}; 