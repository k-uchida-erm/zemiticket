'use client';

import React, { useEffect } from 'react';
import { getBrowserSupabase } from '../../../lib/supabase/client';

export default function AuthCallback(): React.ReactElement {
  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getBrowserSupabase();
        await supabase.auth.getSessionFromUrl({ storeSession: true });
      } catch {
        // ignore
      } finally {
        window.location.replace('/');
      }
    };
    void run();
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center text-[12px] text-neutral-600'>
      認証処理中...
    </div>
  );
}


