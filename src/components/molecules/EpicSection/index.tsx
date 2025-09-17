'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Ticket } from '../../../types';
import TicketItem from './TicketItem';

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'review' | 'done';

interface EpicGroup {
	epic: string;
	researchTopicId?: string | null;
	items: Ticket[];
}

interface EpicSectionProps {
	epicGroups: EpicGroup[];
	sectionTitle: string;
	researchTopicColors?: Record<string, string>;
	statusFilter: 'all' | 'todo' | 'in_progress' | 'review' | 'done';
	onStatusChange?: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => void;
	allTickets?: Ticket[];
}

export default function EpicSection({ epicGroups, sectionTitle, researchTopicColors, statusFilter, onStatusChange, allTickets = [] }: EpicSectionProps): React.ReactElement {
	// Collapsible state per header (section+epic)
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const toggleGroup = (key: string): void => {
		setCollapsed((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
	};


	return (
		<>
			{epicGroups
				.filter((grp) => grp.items && grp.items.length > 0) // チケットがない研究テーマは除外
				.map((grp) => {
					const key = `${sectionTitle.toLowerCase()}-${grp.epic}`;
					const isCollapsed = !!collapsed[key];
					return (
						<React.Fragment key={key}>
							<li className={`sticky top-0 z-10 bg-neutral-100 mt-2 mb-1 px-2.5 py-1.5 text-[10px] text-neutral-600 flex items-center gap-2 rounded-md${grp.epic === '未分類' ? ' border-b border-neutral-200' : ''}`}>
								<button
									onClick={() => toggleGroup(key)}
									className="h-4 w-4 shrink-0 text-neutral-500 flex items-center justify-center hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200"
									aria-expanded={!isCollapsed}
								>
									<svg
										className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
										viewBox="0 0 6 6"
										fill="currentColor"
									>
										<path d="M1 2l2 2 2-2" stroke="currentColor" strokeWidth="0.5" fill="none"/>
									</svg>
								</button>
								<div className="flex items-center gap-2">
									<div
										className="h-2 w-2 rounded-full"
										style={{
											backgroundColor: grp.researchTopicId ? (researchTopicColors?.[grp.researchTopicId] || '#6b7280') : '#6b7280'
										}}
									></div>
									{grp.researchTopicId ? (
										<Link
											href={`/research-topics/${grp.researchTopicId}`}
											className="text-neutral-900 font-medium text-[13px]"
										>
											{grp.epic}
										</Link>
									) : (
										<span className="text-neutral-900 font-medium text-[13px]">{grp.epic}</span>
									)}
								</div>
							</li>
							{!isCollapsed && grp.items
								.filter((p) => {
									if (statusFilter === 'all') return true;
									return (p.status as StatusFilter) === statusFilter;
								})
								.map((p) => (
									<TicketItem
										key={p.id}
										ticket={p}
										subTickets={p.children}
										level={p.level || 0}
										onStatusChange={onStatusChange}
										allTickets={allTickets}
									/>
								))}
						</React.Fragment>
					);
				})}
		</>
	);
}
