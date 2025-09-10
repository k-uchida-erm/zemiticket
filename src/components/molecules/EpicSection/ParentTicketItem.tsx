'use client';

import React from 'react';
import { ParentTask } from '../../../types';
import IconUser from '../../atoms/icons/User';

interface ParentTicketItemProps {
	ticket: ParentTask;
}

// Type guard for optional field due_date without using any
function _hasDueDate(task: ParentTask): task is ParentTask & { due_date: string } {
    return Object.prototype.hasOwnProperty.call(task, 'due_date') && typeof (task as { due_date?: unknown }).due_date === 'string';
}

export default function ParentTicketItem({ ticket }: ParentTicketItemProps): React.ReactElement {
	return (
		<li className="grid grid-cols-[16px_16px_1fr_auto] items-center gap-3 px-2.5 py-2.5 hover:bg-neutral-50">
			<button type="button" className="h-4 w-4 shrink-0 text-neutral-500 flex items-center justify-center hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200">
				<svg
					className="w-3 h-3"
					viewBox="0 0 6 6"
					fill="currentColor"
				>
					<path d="M1 1.5l2 3 2-3z" fill="currentColor"/>
				</svg>
			</button>
			<span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
			<div className="min-w-0">
				<div className="truncate text-[12px] font-medium text-neutral-900">{ticket.title}</div>
			</div>
			<div className="flex items-center gap-2 text-[10px] text-neutral-500">
				<span className="text-[10px] text-neutral-600">left 2weeks</span>
				<IconUser className="w-3.5 h-3.5 text-neutral-500" />
			</div>
		</li>
	);
}
