import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
	try {
		const { access_token, refresh_token } = await req.json();
		if (!access_token || !refresh_token) {
			return NextResponse.json({ ok: false, message: 'Missing tokens' }, { status: 400 });
		}

		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL || '',
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
			{
				cookies: {
					get(name: string) {
						return cookieStore.get(name)?.value;
					},
					set(name: string, value: string, options: Record<string, unknown>) {
						cookieStore.set({ name, value, ...options });
					},
					remove(name: string, options: Record<string, unknown>) {
						cookieStore.delete({ name, ...options });
					},
				},
			}
		);

		const { error } = await supabase.auth.setSession({ access_token, refresh_token });
		if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unexpected error';
		return NextResponse.json({ ok: false, message: msg }, { status: 500 });
	}
} 