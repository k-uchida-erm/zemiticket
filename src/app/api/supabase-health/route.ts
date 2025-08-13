import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  try {
    const supabase = createClient(url, key);
    // Lightweight call: just attempt to fetch current session (no auth expected)
    const { data, error } = await supabase.auth.getSession();
    return NextResponse.json({ ok: true, urlConfigured: !!url, keyConfigured: !!key, session: !!data?.session, error: error?.message || null, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Unknown error' }, { status: 500 });
  }
} 