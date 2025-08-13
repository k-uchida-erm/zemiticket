import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirect = url.searchParams.get('redirect') || '/';

  // If no code, send user to login
  if (!code) {
    const to = new URL('/auth/login', request.url);
    to.searchParams.set('redirect', redirect);
    return NextResponse.redirect(to);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Exchange the code for a session and set cookies
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  // Even if error, redirect to login with message
  if (error) {
    const to = new URL('/auth/login', request.url);
    to.searchParams.set('error', error.message);
    to.searchParams.set('redirect', redirect);
    return NextResponse.redirect(to);
  }

  // Redirect to original destination
  const to = new URL(redirect, request.url);
  return NextResponse.redirect(to);
} 