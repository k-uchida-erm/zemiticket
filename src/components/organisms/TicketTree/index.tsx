"use client";

import { useState } from 'react';
import { ParentTask, SubTask } from '../../../types';
import ParentTicketCard from '../../molecules/ParentTicketCard';

interface TicketTreeProps {
  parent: ParentTask;
  children: SubTask[];
}

function statusToMood(status?: ParentTask['status']): 'great' | 'normal' | 'rush' {
  if (status === 'in_progress') return 'great';
  if (status === 'todo') return 'rush';
  return 'normal';
}

export default function TicketTree({ parent, children }: TicketTreeProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <div className="relative">
      {/* eslint-disable-next-line react/no-children-prop */}
      <ParentTicketCard
        parent={parent}
        children={children}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        mood={statusToMood(parent.status)}
        renderSubticketsInside
      />
    </div>
  );
} 