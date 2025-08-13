"use client";

import { useState, useMemo } from 'react';
import ParentTicketCard from '../ParentTicketCard';
import Avatar from '../../atoms/Avatar';
import { ParentTask, SubTask, Task } from '../../../types';

interface SubmittedTicketCardProps {
  ticket: Task & { children?: SubTask[] };
}

function toParentTask(t: Task): ParentTask {
  return {
    id: t.id,
    title: t.title,
    user: t.user,
    description: t.description,
    slug: t.slug,
    status: t.status,
    priority: t.priority,
    commentsCount: t.commentsCount,
    updatedAt: t.updatedAt,
    estimateHours: t.estimateHours,
    epic: t.epic,
    // optional fields specific to ParentTask
    due: (t as Partial<ParentTask>).due,
    progressPercentage: (t as Partial<ParentTask>).progressPercentage,
  };
}

export default function SubmittedTicketCard({ ticket }: SubmittedTicketCardProps) {
  const parent = toParentTask(ticket);
  const children: SubTask[] = ticket.children || [];
  const latestComment = Array.isArray(ticket.reviewComments) && ticket.reviewComments.length > 0
    ? ticket.reviewComments[ticket.reviewComments.length - 1]
    : undefined;

  const [expanded, setExpanded] = useState<boolean>(true);

  const badge = useMemo(() => {
    const isPending = ticket.reviewDecision === 'pending' || !ticket.reviewDecision;
    const label = isPending ? '未確認' : '確認済み';
    const cls = isPending ? 'bg-neutral-200 text-neutral-700' : 'bg-[#00b393] text-white';
    return (
      <span className={`shrink-0 text-[10px] px-2 py-[2px] rounded-full ${cls}`}>{label}</span>
    );
  }, [ticket.reviewDecision]);

  return (
    <div className="mb-3">
      <ParentTicketCard
        parent={parent}
        subtasks={children}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        renderSubticketsInside
        hideProgress
        hideDue
        childrenReadOnly
        inlineBadge={badge}
      />
      {latestComment && (
        <div className="mt-2 flex items-start gap-2 pl-1">
          <Avatar name={latestComment.author || '教授'} size={28} className="shrink-0" />
          <div className="flex-1 border border-neutral-200 rounded-md bg-white text-[12px] text-neutral-800 px-3 py-2">
            <p className="leading-5 whitespace-pre-line">{latestComment.text}</p>
          </div>
        </div>
      )}
    </div>
  );
} 