"use client";

import { useState, useCallback } from 'react';
import { ParentTask, SubTask } from '../../../types';
import Avatar from '../../atoms/Avatar';
import ParentTicketCard from '../ParentTicketCard';

interface OthersActiveRowProps {
  user: string;
  tickets: Array<ParentTask & { children?: SubTask[] }>; // strictly typed, no any
}

export default function OthersActiveRow({ user, tickets }: OthersActiveRowProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = useCallback((id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })), []);

  return (
    <div className="flex items-start gap-3">
      <div className="pt-1">
        <Avatar name={user} />
      </div>
      <div className="flex-1 space-y-3">
        {tickets.map((t) => (
          // eslint-disable-next-line react/no-children-prop
          <ParentTicketCard
            key={t.id}
            parent={t}
            children={t.children || []}
            expanded={!!expanded[t.id]}
            onToggle={() => toggle(t.id)}
            size="sm"
            renderSubticketsInside
            childrenReadOnly
          />
        ))}
      </div>
    </div>
  );
} 