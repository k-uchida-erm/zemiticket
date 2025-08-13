"use client";

import Image from "next/image";
import Link from "next/link";
import IconUser from "../../atoms/icons/User";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (open && !btnRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.replace('/auth/login');
  }, [router]);

  return (
    <header className="relative h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed inset-x-0 top-0 z-40 before:content-[''] before:absolute before:left-0 before:right-0 before:-top-12 before:h-12 before:bg-white">
      <Link href="/" className="flex items-center gap-3 pl-[0%]">
        <img
          src="/zemiticket_icon.png"
          alt="app icon"
          className="h-10 w-auto"
        />
        <Image
          src="/zemiticket_logo.svg"
          alt="zemiticket"
          width={200}
          height={56}
          priority
          className="h-10 sm:h-11 w-auto"
        />
      </Link>

      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full text-neutral-700 hover:bg-neutral-50 hover:shadow-sm transition-colors"
        >
          <IconUser />
        </button>
        {open && (
          <div ref={menuRef} className="absolute right-0 mt-2 w-44 border border-neutral-200 bg-white shadow-sm">
            <div className="py-1 text-[13px]">
              <Link href="/me" className="block px-3 py-2 hover:bg-neutral-50">個人ページ</Link>
              <Link href="/settings" className="block px-3 py-2 hover:bg-neutral-50">設定</Link>
              <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-neutral-50">ログアウト</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 