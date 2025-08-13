import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Minimal cookie options type compatible with Next's cookies().set
interface CookieSetOptions {
  domain?: string;
  expires?: Date | string | number;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string): string | undefined {
        return cookieStore.get(name)?.value;
      },
      set(_name: string, _value: string, _options: CookieSetOptions = {}): void {
        // no-op: mutation not supported in this context
      },
      remove(_name: string, _options: CookieSetOptions = {}): void {
        // no-op: mutation not supported in this context
      },
    },
  });
} 