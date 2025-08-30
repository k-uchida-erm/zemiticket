"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../../organisms/Header";
import Sidebar from "../../organisms/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  
  // チケットページは独立したスクロール、その他は全ページスクロール
  const isTicketPage = pathname === '/ticket' || pathname.startsWith('/ticket/') || pathname === '/ticket-map';

  // サイドバーの状態を管理する関数
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

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
      <Sidebar onToggle={handleSidebarToggle} />
      <div 
        className="fixed top-16 right-0 bottom-0 transition-all duration-300"
        style={{ 
          left: isSidebarCollapsed ? '4rem' : '15vw'
        }}
      >
        <main className={`h-full ${isTicketPage ? 'overflow-hidden' : 'overflow-auto pt-5 pb-6'}`} style={{ 
          paddingLeft: pathname === '/research' ? '20%' : pathname === '/ticket-map' ? '0%' : '3%', 
          paddingRight: pathname === '/research' ? '20%' : pathname === '/ticket-map' ? '0%' : '3%' 
        }}>
          {pathname === '/ticket-map' ? (
            <div className="overflow-auto h-full">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
} 