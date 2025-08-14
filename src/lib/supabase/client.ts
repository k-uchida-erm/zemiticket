import { createClient } from '@supabase/supabase-js';

type SupabaseBrowserClient = ReturnType<typeof createClient>;

let browserClient: SupabaseBrowserClient | null = null;

export function getBrowserSupabase(): SupabaseBrowserClient {
	if (browserClient) return browserClient;
	if (typeof window === 'undefined') {
		throw new Error('[supabase] getBrowserSupabase called on the server');
	}
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
	}
	browserClient = createClient(supabaseUrl, supabaseAnonKey);
	return browserClient;
} 