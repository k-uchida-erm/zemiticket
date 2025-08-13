"use client";

import Link from 'next/link';
import type { Task } from '../../../types';

interface TicketKanbanCardProps {
  ticket: Task;
  disableLink?: boolean;
}

export default function TicketKanbanCard({ ticket, disableLink = false }: TicketKanbanCardProps) {
  const content = (
    <div className="border border-neutral-200 bg-white px-2 py-1.5 text-[12px] leading-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-normal text-neutral-900 truncate">{ticket.title}</p>
      </div>
    </div>
  );

  return (ticket.slug && !disableLink) ? (
    <Link href={`/ticket/${ticket.slug}`} draggable={false} className="block select-none">
      {content}
    </Link>
  ) : (
    content
  );
} 