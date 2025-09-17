'use client';

import React, { useMemo, useState } from 'react';
import { getBrowserSupabase } from '../../../lib/supabase/client';

type UserRole = 'teacher' | 'student';
type Grade = 'B3' | 'B4' | 'M1' | 'M2' | 'D1' | 'D2' | 'D3';

export default function SignupPage(): React.ReactElement {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [grade, setGrade] = useState<Grade>('B4');
  const [labDisplayName, setLabDisplayName] = useState<string>('');
  const [labColor, setLabColor] = useState<string>('#6b7280');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [infoText, setInfoText] = useState<string>('');

  const isEmailValid = useMemo<boolean>(() => /.+@.+\..+/.test(email), [email]);
  const canNextFromStep1 = useMemo<boolean>(() => role === 'teacher' || role === 'student', [role]);
  const canNextFromStep2 = useMemo<boolean>(() => isEmailValid && password.length >= 8, [isEmailValid, password.length]);
  const canFinish = useMemo<boolean>(() => {
    if (role === 'student') return fullName.trim().length > 0;
    return fullName.trim().length > 0 && labDisplayName.trim().length > 0 && /^#([0-9a-fA-F]{3}){1,2}$/.test(labColor);
  }, [role, fullName, labDisplayName, labColor]);

  const signUpEmailPassword = async (): Promise<void> => {
    setLoading(true);
    setErrorText('');
    setInfoText('');
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          data: { role },
        },
      });
      if (error) throw error;
      setInfoText('確認メールを送信しました。メール内のリンクから登録を完了してください。');
      setStep(3);
    } catch {
      setErrorText('登録に失敗しました。入力内容と設定をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const supabase = getBrowserSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:3000/auth/callback' },
      });
    } catch {
      setErrorText('Google登録を開始できませんでした。設定をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = (): void => {
    // プロファイル/ワークスペース詳細は、確認後の初回ログイン時に別画面で保存する想定
    window.location.replace('/');
  };

  return (
    <div className='relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-neutral-100 to-neutral-400'>
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute inset-0' style={{ backgroundImage: 'linear-gradient(135deg, rgba(245,245,245,0.8) 0%, rgba(229,231,235,0.6) 50%, rgba(243,244,246,0.8) 100%)', backgroundSize: '200% 200%', animation: 'bg-pan 48s ease-in-out infinite alternate' }} />
        <div className='absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neutral-300/40 blur-3xl animate-pulse' style={{ animationDuration: '8s' }} />
        <div className='absolute top-1/4 -right-40 h-80 w-80 rounded-full bg-neutral-400/30 blur-2xl animate-pulse' style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className='absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-neutral-500/25 blur-3xl animate-pulse' style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>
      <div className='relative w-full max-w-[980px] rounded-2xl overflow-hidden backdrop-blur-xl bg-neutral-50/70 border border-neutral-300/60 shadow-[0_16px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5 transition-transform duration-500 hover:scale-[1.002]'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-neutral-300/60 bg-white/40'>
          <div className='text-[12px] uppercase tracking-wider text-neutral-600'>Signup</div>
          <div className='text-[12px] text-neutral-700'>Step {step} / 3</div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-0'>
          <div className='px-10 py-12 border-r border-neutral-300/60 bg-white/50 hidden md:block'>
            <div className='text-[12px] uppercase tracking-wider text-neutral-500'>Zemiticket</div>
            <div className='mt-2 text-[22px] font-semibold text-neutral-900'>研究室のチケット管理</div>
            <div className='mt-2 text-[13px] text-neutral-700'>研究テーマごとにチケットを整理し、MY/ALLで視点を切替。</div>
            <div className='mt-6 text-[11px] text-neutral-600'>登録後すぐにホームへ移動します。先生はワークスペース作成、生徒は参加から始めます。</div>
          </div>

          <div className='px-10 py-12 bg-white/60'>
            {step === 1 && (
              <div>
                <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-200/70 text-neutral-700 text-[11px]'>基本設定</div>
                <div className='mt-2 text-[20px] font-semibold text-neutral-900'>ロールを選択</div>
                <div className='mt-1 text-[12px] text-neutral-600'>先生か学生かを選んでください。</div>

                <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => setRole('student')}
                    className={`text-left p-5 rounded-xl transition min-h-[156px] flex flex-col justify-center ${role==='student' ? 'bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 text-white shadow-lg hover:shadow-xl' : 'bg-gradient-to-br from-white/60 via-neutral-100/50 to-white/60 border border-neutral-400/80 hover:bg-gradient-to-br hover:from-white/70 hover:via-neutral-200/60 hover:to-white/70 hover:shadow-sm backdrop-blur-sm'} hover:-translate-y-[1px]`}
                  >
                    <div className='flex items-center gap-2'>
                      <svg className='h-8 w-8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M3 7l9-3 9 3-9 3-9-3z' />
                        <path d='M7 9v3c0 1.657 2.5 3 5 3s5-1.343 5-3V9' />
                      </svg>
                      <div className={`text-[18px] sm:text-[20px] font-semibold leading-none ${role==='student' ? 'text-white' : ''}`}>学生</div>
                    </div>
                    <ul className={`mt-3 list-disc pl-5 text-[12px] ${role==='student' ? 'text-white/90' : 'text-neutral-700'} leading-relaxed space-y-1.5`}>
                      <li>ワークスペースに参加</li>
                      <li>個人での利用も</li>
                      <li>チームでの研究</li>
                    </ul>
                  </button>
                  <button
                    type='button'
                    onClick={() => setRole('teacher')}
                    className={`text-left p-5 rounded-xl transition min-h-[156px] flex flex-col justify-center ${role==='teacher' ? 'bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 text-white shadow-lg hover:shadow-xl' : 'bg-gradient-to-br from-white/60 via-neutral-100/50 to-white/60 border border-neutral-400/80 hover:bg-gradient-to-br hover:from-white/70 hover:via-neutral-200/60 hover:to-white/70 hover:shadow-sm backdrop-blur-sm'} hover:-translate-y-[1px]`}
                  >
                    <div className='flex items-center gap-2'>
                      <svg className='h-8 w-8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M3 5h8a5 5 0 0 1 5 5v9H8a5 5 0 0 0-5-5V5z' />
                        <path d='M21 5h-8a5 5 0 0 0-5 5v9h8a5 5 0 0 1 5-5V5z' />
                      </svg>
                      <div className={`text-[18px] sm:text-[20px] font-semibold leading-none ${role==='teacher' ? 'text-white' : ''}`}>先生</div>
                    </div>
                    <ul className={`mt-3 list-disc pl-5 text-[12px] ${role==='teacher' ? 'text-white/90' : 'text-neutral-700'} leading-relaxed space-y-1.5`}>
                      <li>ワークスペースの管理者</li>
                      <li>研究室単位での利用</li>
                      <li>学生の進捗を一元管理</li>
                    </ul>
                  </button>
                </div>

                <div className='mt-6 flex justify-end'>
                  <button
                    type='button'
                    onClick={() => setStep(2)}
                    disabled={!canNextFromStep1}
                    className='px-4 py-2 rounded-lg text-white text-[13px] disabled:opacity-50 bg-neutral-700/90 hover:bg-neutral-700 shadow-sm border border-white/20 backdrop-blur hover:-translate-y-[1px] transition'
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-200/70 text-neutral-700 text-[11px]'>アカウント</div>
                <div className='mt-2 text-[20px] font-semibold text-neutral-900'>アカウント作成</div>
                <div className='mt-1 text-[12px] text-neutral-600'>メールとパスワードで登録、またはGoogleで続行。</div>

                <div className='mt-4 rounded-xl border border-neutral-300/60 bg-gradient-to-b from-neutral-100/60 to-white/70 p-4'>
                  <label className='block mb-2 text-[12px] font-medium text-neutral-700'>メールアドレス</label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='email@example.com'
                    className='w-full border border-neutral-300/70 bg-white/80 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400'
                    aria-invalid={!isEmailValid && email.length>0}
                  />

                  <label className='block mt-3 mb-2 text-[12px] font-medium text-neutral-700'>パスワード（8文字以上）</label>
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='8文字以上'
                    className='w-full border border-neutral-300/70 bg-white/80 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400'
                  />
                </div>

                <div className='mt-4 flex gap-2'>
                  <button
                    type='button'
                    onClick={signUpEmailPassword}
                    disabled={loading || !canNextFromStep2}
                    className='px-4 py-2 rounded-lg text-white text-[13px] disabled:opacity-50 bg-neutral-700/90 hover:bg-neutral-700 shadow-sm border border-white/20 backdrop-blur hover:-translate-y-[1px] transition'
                  >
                    {loading ? '処理中...' : 'メールで登録する'}
                  </button>
                  <button
                    type='button'
                    onClick={signUpWithGoogle}
                    className='px-4 py-2 rounded-lg border border-neutral-400/80 text-neutral-800 text-[13px] bg-white/90 hover:bg-white hover:-translate-y-[1px] transition'
                  >
                    Googleで続行
                  </button>
                </div>

                {errorText && <div className='mt-3 text-[12px] text-red-600'>{errorText}</div>}
                {infoText && <div className='mt-3 text-[12px] text-neutral-600'>{infoText}</div>}

                <div className='mt-6 flex justify-between'>
                  <button type='button' onClick={() => setStep(1)} className='text-[12px] text-neutral-600 hover:opacity-80'>戻る</button>
                  <div className='text-[12px] text-neutral-600'>すでにアカウントがありますか？ <a className='underline' href='/auth/login'>ログイン</a></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-200/70 text-neutral-700 text-[11px]'>プロフィール</div>
                <div className='mt-2 text-[20px] font-semibold text-neutral-900'>プロフィール</div>
                <div className='mt-1 text-[12px] text-neutral-600'>最小限の情報を設定して完了します（必要に応じて後で編集可能）。</div>

                <div className='mt-4 rounded-xl border border-neutral-300/60 bg-gradient-to-b from-neutral-100/60 to-white/70 p-4'>
                  <label className='block mb-2 text-[12px] font-medium text-neutral-700'>氏名</label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder='山田 太郎'
                    className='w-full border border-neutral-300/70 bg-white/80 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400'
                  />

                {role === 'student' ? (
                  <div className='mt-3'>
                    <label className='block mb-2 text-[12px] font-medium text-neutral-700'>学年</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as Grade)}
                      className='w-full border border-neutral-300/70 bg-white/85 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400'
                    >
                      {(['B3','B4','M1','M2','D1','D2','D3'] as Grade[]).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div>
                      <label className='block mb-2 text-[12px] font-medium text-neutral-700'>研究室表示名</label>
                      <input
                        type='text'
                        value={labDisplayName}
                        onChange={(e) => setLabDisplayName(e.target.value)}
                        placeholder='例: 水文循環研'
                        className='w-full border border-neutral-300/70 bg-white/80 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400'
                      />
                    </div>
                    <div>
                      <label className='block mb-2 text-[12px] font-medium text-neutral-700'>テーマカラー</label>
                      <input
                        type='color'
                        value={labColor}
                        onChange={(e) => setLabColor(e.target.value)}
                        className='w-full h-[38px] border border-neutral-300/70 bg-white/80 rounded-lg'
                        aria-label='研究室テーマカラー'
                      />
                    </div>
                  </div>
                )}
                </div>

                <div className='mt-6 flex justify-between'>
                  <button type='button' onClick={() => setStep(2)} className='text-[12px] text-neutral-600 hover:opacity-80'>戻る</button>
                  <button
                    type='button'
                    onClick={finishSetup}
                    disabled={!canFinish}
                    className='px-4 py-2 rounded-lg text-white text-[13px] disabled:opacity-50 bg-neutral-700/90 hover:bg-neutral-700 shadow-sm border border-white/20 backdrop-blur hover:-translate-y-[1px] transition'
                  >
                    完了してホームへ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes bg-pan {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}


