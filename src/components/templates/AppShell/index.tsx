"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Header from "../../organisms/Header";
import Sidebar from "../../organisms/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const collapsedSidebarWidth = '3.5vw';
  const contentMarginLeft = useMemo(() => collapsedSidebarWidth, []);
  const pathname = usePathname();

  // Redirect implicit OAuth token hashes to /auth/login for processing
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      const hash = window.location.hash;
      if (!pathname.startsWith('/auth/login')) {
        window.location.replace(`/auth/login${hash}`);
      }
    }
  }, [pathname]);

  const isAuthRoute = pathname === '/auth/login' || pathname.startsWith('/auth/');

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-white">
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      <Sidebar />
      <div style={{ marginLeft: contentMarginLeft }} className="fixed top-16 right-0 bottom-0 left-[3.5vw]">
        <main className="h-full overflow-auto px-[12%] pt-5 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
} 