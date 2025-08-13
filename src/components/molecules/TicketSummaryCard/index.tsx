import { Task, SubTask, ParentTask } from '../../../types';
import Link from 'next/link';

interface TicketSummaryCardProps {
  ticket: Task;
  subtitle?: string;
  className?: string;
}

function hasDue(t: Task): t is SubTask | ParentTask {
  return 'due' in t && typeof (t as SubTask | ParentTask).due !== 'undefined';
}

export default function TicketSummaryCard({ ticket, subtitle, className = '' }: TicketSummaryCardProps) {
  const latestComment = Array.isArray(ticket.reviewComments) && ticket.reviewComments.length > 0
    ? ticket.reviewComments[ticket.reviewComments.length - 1]
    : undefined;

  const content = (
    <div className={`bg-white rounded-md border border-gray-200 p-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {subtitle && <p className="text-[11px] text-gray-500 mb-0.5">{subtitle}</p>}
          <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.title}</h4>
          <div className="mt-1 text-[11px] text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {ticket.status && <span>Status: {ticket.status.replace('_', ' ')}</span>}
            {ticket.priority && <span>Priority: {ticket.priority}</span>}
            {typeof ticket.estimateHours === 'number' && <span>Est: {ticket.estimateHours}h</span>}
            {hasDue(ticket) && ticket.due && (
              <span>due {ticket.due}</span>
            )}
            {ticket.reviewDecision && <span>Decision: {ticket.reviewDecision}</span>}
          </div>
          {(latestComment || typeof ticket.commentsCount === 'number' || ticket.updatedAt) && (
            <div className="mt-1 text-[11px] text-gray-600 flex items-center gap-3">
              {latestComment && (
                <span className="truncate max-w-[22rem]">“{latestComment.text}”</span>
              )}
              {typeof ticket.commentsCount === 'number' && <span>💬 {ticket.commentsCount}</span>}
              {ticket.updatedAt && <span>updated {ticket.updatedAt}</span>}
            </div>
          )}
        </div>
        <span className="text-[11px] shrink-0 text-gray-600">{ticket.user}</span>
      </div>
    </div>
  );

  return ticket.slug ? (
    <Link href={`/ticket/${ticket.slug}`} aria-label={`${ticket.title} details`} className="block focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
      {content}
    </Link>
  ) : (
    content
  );
} 