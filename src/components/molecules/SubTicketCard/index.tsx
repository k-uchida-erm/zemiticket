"use client";

import { useState, useCallback } from 'react';
import { SubTask } from '../../../types';
import Card from '../../atoms/Card';
import Link from 'next/link';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import StatusDot from '../../atoms/StatusDot';

interface SubTicketCardProps {
  ticket: SubTask;
  compact?: boolean;
  variant?: 'card' | 'flat';
  readOnly?: boolean;
  disableLink?: boolean;
}

export default function SubTicketCard({ ticket, compact = true, variant = 'card', readOnly = false, disableLink = false }: SubTicketCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(readOnly ? true : !!ticket.done);
  const [todos, setTodos] = useState(ticket.todos || []);

  const onToggleSub = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setDone((v) => !v);
  };

  const onToggleTodo = (id: number) => (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const TitleRow = (
    <div className="min-w-0 flex items-center gap-2">
      <p className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-normal text-neutral-900 truncate`}>{ticket.title}</p>
      {typeof ticket.estimateHours === 'number' && (
        <span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white">{ticket.estimateHours}h</span>
      )}
      {Array.isArray(todos) && todos.length > 0 && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
          aria-expanded={open}
          className="ml-1 h-5 w-5 inline-flex items-center justify-center rounded text-neutral-600 hover:bg-neutral-50 shrink-0"
        >
          <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );

  const Todos = open && Array.isArray(todos) && todos.length > 0 && (
    <div className="mt-0 pl-6">
      <ul className="space-y-0 divide-y divide-neutral-200">
        {todos.map((t) => (
          <li key={t.id}>
            <div className="flex items-center justify-between text-[12px] text-neutral-700 px-1 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <StatusDot completed={readOnly ? true : !!t.done} variant="todo" onClick={onToggleTodo(t.id)} disabled={readOnly} className={readOnly ? 'cursor-default' : ''} />
                <span className="truncate">{t.title}</span>
                {typeof t.estimateHours === 'number' && (
                  <span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-amber-400 text-white">{t.estimateHours}h</span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2 text-neutral-500">
                {t.due && <span>due {t.due}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  if (variant === 'flat') {
    const row = (
      <div className="w-full">
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <StatusDot completed={readOnly ? true : done} variant="todo" onClick={onToggleSub} disabled={readOnly} className={readOnly ? 'cursor-default' : ''} />
            <div className="flex-1 min-w-0">{TitleRow}</div>
          </div>
        </div>
        {Todos}
      </div>
    );
    return (ticket.slug && !disableLink) ? (
      <Link href={`/ticket/${ticket.slug}`} aria-label={`${ticket.title} details`} className="block focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
        {row}
      </Link>
    ) : row;
  }

  const body = (
    <Card className={`w-full max-w-full ${compact ? 'pr-1.5 pl-3 py-1.5' : 'p-3'}`}>
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot completed={readOnly ? true : done} variant="todo" onClick={onToggleSub} disabled={readOnly} className={readOnly ? 'cursor-default' : ''} />
          <div className="flex-1 min-w-0">{TitleRow}</div>
        </div>
      </div>
      {Todos}
    </Card>
  );

  return (ticket.slug && !disableLink) ? (
    <Link href={`/ticket/${ticket.slug}`} aria-label={`${ticket.title} details`} className="block focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
      {body}
    </Link>
  ) : (
    body
  );
} 