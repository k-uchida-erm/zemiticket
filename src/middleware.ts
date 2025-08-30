import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // 認証を一時的に無効化 - 開発環境用
  return NextResponse.next();
  
  // 以下は認証が必要な場合のロジック（現在は無効）
  /*
  const { nextUrl, cookies: reqCookies } = req;
  const pathname = nextUrl.pathname;

  if ([...PUBLIC_PATHS].some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is missing in this environment (e.g., preview), skip auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // On Supabase error, allow request to continue rather than failing middleware
      return res;
    }

    const hasSession = !!data.session;
    if (!hasSession) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (_) {
    // Never throw in middleware; proceed to next to avoid 500
    return res;
  }
  */
}

export const config = {
  matcher: ['/((?!_next|static|api|.*\..*).*)'],
}; 