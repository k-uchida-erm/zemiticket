"use client";

import { useState, useCallback } from 'react';
import type { Task } from '../../../types';
import TicketKanbanCard from '../../molecules/TicketKanbanCard';

interface TicketKanbanProps {
  tickets: Task[];
}

type ColKey = 'todo' | 'in_progress' | 'review';

const COLUMNS: { key: ColKey; title: string }[] = [
  { key: 'todo', title: 'To do' },
  { key: 'in_progress', title: 'In progress' },
  { key: 'review', title: 'In review' },
];

const CHIP: Record<ColKey, string> = {
  todo: 'bg-slate-200 text-slate-800',
  in_progress: 'bg-[#00b393]/20 text-[#00b393]',
  review: 'bg-indigo-200 text-indigo-800',
};

export default function TicketKanban({ tickets }: TicketKanbanProps) {
  const [cols, setCols] = useState<Record<ColKey, Task[]>>({
    todo: tickets.filter((t) => t.status === 'todo'),
    in_progress: tickets.filter((t) => t.status === 'in_progress'),
    review: tickets.filter((t) => t.status === 'review'),
  });

  const onDragStart = useCallback((e: React.DragEvent, task: Task, from: ColKey) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, from }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent, to: ColKey) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    const { id, from } = JSON.parse(data) as { id: number; from: ColKey };
    if (from === to) return;
    setCols((prev) => {
      const source = [...prev[from]];
      const target = [...prev[to]];
      const idx = source.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const [task] = source.splice(idx, 1);
      const updated: Task = { ...task, status: to };
      target.unshift(updated);
      return { ...prev, [from]: source, [to]: target };
    });
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <section>
      <div className="grid grid-cols-3 gap-0 divide-x divide-neutral-200 overflow-hidden">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <div className="px-2 py-1.5 text-[12px]">
              <span className={`inline-block px-2 py-0.5 rounded-full ${CHIP[col.key]}`}>{col.title}</span>
            </div>
            <div
              className="min-h-[140px] p-1.5 space-y-1.5"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.key)}
            >
              {cols[col.key].map((t) => (
                <div key={t.id} draggable onDragStart={(e) => onDragStart(e, t, col.key)}>
                  <TicketKanbanCard ticket={t} disableLink />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 