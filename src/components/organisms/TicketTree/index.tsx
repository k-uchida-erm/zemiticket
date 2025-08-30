"use client";

import { useState } from 'react';
import { ParentTask, SubTask } from '../../../types';
import ParentTicketCard from '../../molecules/ParentTicketCard';

interface TicketTreeProps {
  parent: ParentTask;
  subtasks: SubTask[];
}

function statusToMood(status?: ParentTask['status']): 'great' | 'normal' | 'rush' {
  if (status === 'in_progress') return 'great';
  if (status === 'todo') return 'rush';
  return 'normal';
}

export default function TicketTree({ parent, subtasks }: TicketTreeProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  
  console.log('TicketTree parent:', parent);
  console.log('TicketTree parent.estimateHours:', parent.estimateHours);
  console.log('TicketTree subtasks:', subtasks);
  subtasks.forEach((subtask, index) => {
    console.log(`Subtask ${index} estimateHours:`, subtask.estimateHours);
    if (subtask.todos) {
      subtask.todos.forEach((todo, todoIndex) => {
        console.log(`  Todo ${todoIndex} estimateHours:`, todo.estimateHours);
      });
    }
  });

  return (
    <div className="relative">
      <ParentTicketCard
        parent={parent}
        subtasks={subtasks}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        mood={statusToMood(parent.status)}
        renderSubticketsInside
      />
    </div>
  );
} 