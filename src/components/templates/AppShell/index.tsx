"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Header from "../../organisms/Header";
import Sidebar from "../../organisms/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const collapsedSidebarWidth = '3.5vw';
  const contentMarginLeft = useMemo(() => collapsedSidebarWidth, []);
  const pathname = usePathname();
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