"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { ParentTask, SubTask } from '../../../types';
import ParentTicketCard from '../../molecules/ParentTicketCard';
import SubTicketCard from '../../molecules/SubTicketCard';

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
  const listRef = useRef<HTMLUListElement | null>(null);
  const [greenHeight, setGreenHeight] = useState<number>(0);

  const lastCompletedIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < children.length; i += 1) {
      if (children[i].done) idx = i;
    }
    return idx;
  }, [children]);

  useEffect(() => {
    if (!expanded || !listRef.current) {
      setGreenHeight(0);
      return;
    }
    if (lastCompletedIndex < 0) {
      setGreenHeight(0);
      return;
    }
    const listEl = listRef.current;
    const childEl = listEl.children.item(lastCompletedIndex) as HTMLElement | null;
    if (!childEl) {
      setGreenHeight(0);
      return;
    }
    const height = childEl.offsetTop + childEl.offsetHeight / 2;
    setGreenHeight(height);
  }, [expanded, children, lastCompletedIndex]);

  return (
    <div className="relative">
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