'use client';

import React, { useState } from 'react';
import { Ticket } from '../../../types';
import IconUser from '../../atoms/icons/User';

interface TicketItemProps {
  ticket: Ticket;
  subTickets?: Ticket[];
  onToggleExpanded?: (ticketId: string) => void;
  isExpanded?: boolean;
  level?: number;
}

export default function TicketItem({
  ticket,
  subTickets = [],
  onToggleExpanded,
  isExpanded = false,
  level = 0
}: TicketItemProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggleExpanded) {
      onToggleExpanded(ticket.id);
    }
  };

  const hasChildren = subTickets && subTickets.length > 0;

  return (
    <>
      <li className="grid grid-cols-[16px_16px_1fr_auto] items-center gap-3 px-2.5 py-2.5 hover:bg-neutral-50">
        <button
          type="button"
          className="h-4 w-4 shrink-0 text-neutral-500 flex items-center justify-center hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          onClick={handleToggle}
          disabled={!hasChildren}
        >
          {hasChildren && (
            <svg
              className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
              viewBox="0 0 6 6"
              fill="currentColor"
            >
              <path d="M1 1.5l2 3 2-3z" fill="currentColor"/>
            </svg>
          )}
        </button>
        <div className="inline-flex items-center justify-center h-3.5 w-3.5">
          {ticket.status === 'in_progress' ? (
            <div className="h-3.5 w-3.5 rounded-full bg-orange-400 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white translate-y-[1px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5z"/>
              </svg>
            </div>
          ) : ticket.status === 'todo' ? (
            <div className="h-3.5 w-3.5 rounded-full bg-neutral-200"></div>
          ) : ticket.status === 'review' ? (
            <div className="h-3.5 w-3.5 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
          ) : ticket.status === 'done' ? (
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" strokeWidth="3.5" strokeLinecap="butt" strokeLinejoin="miter">
                <path d="M6 10.5 L10.5 15 L18 8" stroke="currentColor" fill="none"/>
              </svg>
            </div>
          ) : (
            <div className="h-3.5 w-3.5 rounded-full bg-neutral-300"></div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-neutral-900">{ticket.title}</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          <span className="text-[10px] text-neutral-600">left 2weeks</span>
          <IconUser className="w-3.5 h-3.5 text-neutral-500" />
        </div>
      </li>

      {/* サブチケットの表示 */}
      {hasChildren && !isCollapsed && (
        <li className="ml-4">
          <ul className="space-y-0">
            {subTickets.map((child) => (
              <TicketItem
                key={child.id}
                ticket={child}
                subTickets={child.children}
                onToggleExpanded={onToggleExpanded}
                level={level + 1}
              />
            ))}
          </ul>
        </li>
      )}
    </>
  );
}
