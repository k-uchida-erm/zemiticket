"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import IconHome from "../../atoms/icons/Home";
import IconTicket from "../../atoms/icons/Ticket";
import IconFlask from "../../atoms/icons/Flask";
import IconCalendarCheck from "../../atoms/icons/CalendarCheck";
import IconChat from "../../atoms/icons/Chat";
import IconFolderUpload from "../../atoms/icons/FolderUpload";

export default function Sidebar() {
  const pathname = usePathname();

  const navItem = (
    href: string,
    label: string,
    icon: ReactNode
  ) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
          active ? "bg-[#00b393]/10 border border-[#00b393]/20" : "hover:bg-neutral-100/60"
        }`}
      >
        {/* removed green active vertical bar */}
        <span
          className={`inline-flex items-center justify-center w-5 h-5 ${
            active ? "text-[#00b393]" : "text-neutral-500 group-hover:text-neutral-800"
          }`}
        >
          {icon}
        </span>
        <span
          className={`text-sm tracking-tight ${
            active ? "text-[#00b393] font-medium" : "text-neutral-800"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={`w-[12vw] fixed top-16 bottom-0 left-0 z-30 bg-white border-r border-neutral-200 flex flex-col shadow-sm overscroll-contain`}
      aria-label="サイドバー"
    >
      <nav className="flex-1 py-1 overflow-auto mt-3 pl-2 pr-2 overscroll-contain">
        <ul className="space-y-1">
          <li className="mt-0">{navItem("/", "ホーム", <IconHome />)}</li>
          <li>{navItem("/research", "研究設定", <IconFlask />)}</li>
          <li>{navItem("/ticket", "チケット", <IconTicket />)}</li>
          <li>{navItem("/schedule", "スケジュール", <IconCalendarCheck />)}</li>
          <li>{navItem("/chat", "チャット", <IconChat />)}</li>
          <li>{navItem("/upload", "アップロード", <IconFolderUpload />)}</li>
        </ul>
      </nav>
    </aside>
  );
} 