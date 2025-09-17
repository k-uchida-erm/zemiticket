'use client';

import React, { useMemo, useState } from 'react';
import { getBrowserSupabase } from '../../../lib/supabase/client';

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [infoText, setInfoText] = useState<string>('');

  const isEmailValid = useMemo<boolean>(() => {
    if (!email) return false;
    return /.+@.+\..+/.test(email);
  }, [email]);

  const handleEmailLogin = async (): Promise<void> => {
    setLoading(true);
    setErrorText('');
    setInfoText('');
    try {
      const supabase = getBrowserSupabase();
      // サインイン（メール+パスワード）
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.replace('/');
    } catch {
      setErrorText('処理に失敗しました。入力内容とネットワーク設定をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorText('');
      const supabase = getBrowserSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      // リダイレクトされる
    } catch {
      setErrorText('Google認証を開始できませんでした。設定をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4'>
      <div className='w-full max-w-[880px] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-neutral-200 bg-white'>
        <div className='hidden md:flex flex-col justify-between p-8 bg-neutral-900 text-white'>
          <div>
            <div className='text-[12px] uppercase tracking-wider text-neutral-400'>Zemiticket</div>
            <div className='mt-2 text-[24px] font-semibold'>研究室のチケット管理</div>
            <div className='mt-2 text-[13px] text-neutral-300'>
              研究テーマごとにチケットを整理。MY/ALLで担当と全体をすばやく切替。
            </div>
          </div>
          <div className='text-[11px] text-neutral-400'>
            ログインはメールのMagic Linkで行います。パスワードは不要です。
          </div>
        </div>

        <div className='p-8'>
          <div className='mb-6'>
            <div className='text-[22px] font-semibold text-neutral-900'>ログイン</div>
            <div className='mt-1 text-[12px] text-neutral-500'>メールとパスワードでログインします。</div>
          </div>

          <label className='block mb-2 text-[12px] font-medium text-neutral-700'>メールアドレス</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@example.com'
            className='w-full border border-neutral-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400'
            aria-invalid={!isEmailValid && email.length>0}
          />
          <label className='block mt-3 mb-2 text-[12px] font-medium text-neutral-700'>パスワード</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='8文字以上'
            className='w-full border border-neutral-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400'
          />

          <button
            onClick={handleEmailLogin}
            disabled={loading || !isEmailValid || password.length===0}
            className='mt-4 w-full bg-neutral-900 text-white text-[13px] rounded-lg py-2 disabled:opacity-50 hover:bg-neutral-800 transition-colors'
          >
            {loading ? '処理中...' : 'ログイン'}
          </button>

          <div className='mt-4'>
            <button
              type='button'
              onClick={handleGoogle}
              className='w-full border border-neutral-300 bg-white text-neutral-800 text-[13px] rounded-lg py-2 hover:bg-neutral-50 transition-colors'
            >
              Googleで続行
            </button>
          </div>

          <div className='mt-4 text-[12px] text-neutral-600'>
            アカウントをお持ちでないですか？
            <a href='/auth/signup' className='ml-1 underline hover:opacity-80'>新規登録</a>
          </div>

          {errorText && <div className='mt-3 text-[12px] text-red-600'>{errorText}</div>}
          {infoText && <div className='mt-3 text-[12px] text-neutral-600'>{infoText}</div>}

          <div className='mt-6 text-[11px] text-neutral-500'>
            ログイン後に、研究室のワークスペースを作成（先生）または検索して参加（生徒）できます。
          </div>
        </div>
      </div>
    </div>
  );
}


