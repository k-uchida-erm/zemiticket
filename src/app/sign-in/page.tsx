"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "../../lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof getBrowserSupabase> | null>(null);

  useEffect(() => {
    supabaseRef.current = getBrowserSupabase();
    supabaseRef.current.auth.getUser().then((res: { data: { user: { email?: string } | null } }) => setUserEmail(res.data.user?.email ?? null));
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
    const redirectTo = `${origin}/auth/callback`;
    const { error } = await supabaseRef.current!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }, [email]);

  const signInWith = (provider: 'google' | 'github') => async () => {
    setError(null);
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
    const redirectTo = `${origin}/auth/callback`;
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