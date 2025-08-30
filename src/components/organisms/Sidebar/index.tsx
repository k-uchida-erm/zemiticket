"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import IconHome from "../../atoms/icons/Home";
import IconTicket from "../../atoms/icons/Ticket";
import IconFlask from "../../atoms/icons/Flask";
import IconCalendarCheck from "../../atoms/icons/CalendarCheck";
import IconChat from "../../atoms/icons/Chat";
import IconFolderUpload from "../../atoms/icons/FolderUpload";
import ToggleButton from "../../atoms/ToggleButton";

export default function Sidebar({ onToggle }: { onToggle: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showText, setShowText] = useState(false);

  // サイドバーの状態が変更された時に親コンポーネントに通知
  useEffect(() => {
    onToggle(isCollapsed);
  }, [isCollapsed, onToggle]);

  // サイドバーの開閉アニメーション完了後に文字を表示
  useEffect(() => {
    if (isCollapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => {
        setShowText(true);
      }, 300); // アニメーション完了時間（duration-300）と同じ
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  const navItem = (
    href: string,
    label: string,
    icon: ReactNode
  ) => {
    // チケットセクションの場合は、/ticketで始まるパスすべてを選択中状態にする
    const isTicketSection = href === "/ticket";
    const active = isTicketSection 
      ? pathname.startsWith("/ticket") 
      : pathname === href;

    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
          active ? "bg-[#00b393]/10 border border-[#00b393]/20" : "hover:bg-neutral-100/60"
        }`}
        title={isCollapsed ? label : undefined}
      >
        <span
          className={`inline-flex items-center justify-center w-5 h-5 ${
            active ? "text-[#00b393]" : "text-neutral-500 group-hover:text-neutral-800"
          }`}
        >
          {icon}
        </span>
        {showText && !isCollapsed && (
          <span
            className={`text-sm tracking-tight ${
              active ? "text-[#00b393] font-medium" : "text-neutral-800"
            }`}
          >
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-30 bg-white border-r border-neutral-200 flex flex-col shadow-sm overscroll-contain transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-[15vw]'
      }`}
      aria-label="サイドバー"
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-end pt-2 pb-1 px-3">
        <ToggleButton
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        />
      </div>

      <nav className="flex-1 py-1 overflow-auto pl-2 pr-2 overscroll-contain">
        <ul className="space-y-1">
          <li className="mt-0">{navItem("/", "ホーム", <IconHome />)}</li>
          <li>{navItem("/ticket", "チケット", <IconTicket />)}</li>
          <li>{navItem("/ticket-map", "チケットマップ", <IconTicket />)}</li>
          <li>{navItem("/schedule", "スケジュール", <IconCalendarCheck />)}</li>
          <li>{navItem("/chat", "チャット", <IconChat />)}</li>
          <li>{navItem("/upload", "アップロード", <IconFolderUpload />)}</li>
          <li>{navItem("/research", "研究設定", <IconFlask />)}</li>
        </ul>
      </nav>
    </aside>
  );
} 