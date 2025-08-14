"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = useMemo(() => params.get('redirect') || '/', [params]);
  const supabaseRef = useRef<ReturnType<typeof getBrowserSupabase> | null>(null);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Initialize browser client and handle potential redirect hash
    supabaseRef.current = getBrowserSupabase();

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && hash.includes('access_token')) {
      const query = new URLSearchParams(hash.replace(/^#/, ''));
      const access_token = query.get('access_token');
      const refresh_token = query.get('refresh_token');
      if (access_token && refresh_token) {
        (async () => {
          const { error } = await supabaseRef.current!.auth.setSession({ access_token, refresh_token });
          if (error) {
            setError(error.message);
            return;
          }
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
          const baseUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || origin);
          const dest = nextPath || '/';
          // Absolute redirect to ensure correct origin
          if (typeof window !== 'undefined') window.location.replace(`${baseUrl}${dest}`);
          // Fire-and-forget cookie sync
          fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token })
          }).catch(() => {});
        })();
      }
    }

    // Fetch current user email if signed in
    supabaseRef.current.auth.getUser().then((res: { data: { user: { email?: string } | null } }) => setUserEmail(res.data.user?.email ?? null));
  }, [nextPath, router]);

  // If already logged in and no hash to process, redirect immediately
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (userEmail && (!hash || !hash.includes('access_token'))) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
      const baseUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || origin);
      const dest = nextPath || '/';
      if (typeof window !== 'undefined') window.location.replace(`${baseUrl}${dest}`);
    }
  }, [userEmail, nextPath, router]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
    const baseUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || origin);
    const redirectTo = `${baseUrl}/auth/callback?redirect=${encodeURIComponent(nextPath)}`;
    const { error } = await supabaseRef.current!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }, [email, nextPath]);

  const signInWith = (provider: 'google' | 'github') => async () => {
    setError(null);
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
    const baseUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || origin);
    const redirectTo = `${baseUrl}/auth/callback?redirect=${encodeURIComponent(nextPath)}`;
    const { error } = await supabaseRef.current!.auth.signInWithOAuth({ provider, options: { redirectTo } });
    setLoading(false);
    if (error) setError(error.message);
  };

  const onSignOut = async () => {
    await supabaseRef.current!.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-white">
      <div className="w-full max-w-sm border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex w-7 h-7 items-center justify-center rounded-xl bg-[#00b393]/10 border border-[#00b393]/20 text-[#00b393] font-semibold">Z</span>
          <h1 className="text-[18px] font-semibold text-neutral-900">Sign in</h1>
        </div>
        {userEmail ? (
          <div className="mt-2 text-sm text-neutral-800 space-y-2">
            <p>Signed in as <span className="font-medium">{userEmail}</span></p>
            <button onClick={onSignOut} className="text-sm px-3 py-1.5 border border-neutral-300">Sign out</button>
          </div>
        ) : (
          <>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={signInWith('google')} disabled={loading} className="text-sm px-3 py-2 border border-neutral-300 hover:bg-neutral-50">Continue with Google</button>
              <button onClick={signInWith('github')} disabled={loading} className="text-sm px-3 py-2 border border-neutral-300 hover:bg-neutral-50">Continue with GitHub</button>
            </div>
            <div className="my-3 h-px bg-neutral-200" />
            {sent ? (
              <p className="text-sm text-neutral-700">Magic link を {email} に送信しました。メールのリンクからサインインしてください。</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <label className="block text-[12px] text-neutral-600">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-neutral-300 px-3 py-2 text-sm"
                />
                <button type="submit" disabled={loading} className="w-full px-3 py-2 text-sm border border-neutral-300 bg-neutral-900 text-white disabled:opacity-60">Send magic link</button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 
