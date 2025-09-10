'use client';

import React, { useState } from 'react';
import { Ticket } from '../../../types';
import SegmentedTabs, { SegmentedOptionValue } from '../../atoms/SegmentedTabs';
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
}

export default function EpicSection({ epicGroups, sectionTitle, researchTopicColors }: EpicSectionProps): React.ReactElement {
	// Collapsible state per header (section+epic)
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const toggleGroup = (key: string): void => {
		setCollapsed((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
	};

	// Status filter per epic header (UI only)
	const [groupStatus, setGroupStatus] = useState<Record<string, StatusFilter>>({});
	const setGroupTab = (key: string, tab: StatusFilter): void => {
		setGroupStatus((prev: Record<string, StatusFilter>) => ({ ...prev, [key]: tab }));
	};

	return (
		<>
			{epicGroups.map((grp) => {
				const key = `${sectionTitle.toLowerCase()}-${grp.epic}`;
				const isCollapsed = !!collapsed[key];
				return (
					<React.Fragment key={key}>
						<li className={`sticky top-0 z-10 bg-neutral-100 mt-2 mb-1 px-2.5 py-1 text-[10px] text-neutral-600 flex items-center gap-2 justify-between rounded-md${grp.epic === '未分類' ? ' border-b border-neutral-200' : ''}`}>
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
									<path d="M1 1.5l2 3 2-3z" fill="currentColor"/>
								</svg>
							</button>
							<div className="flex items-center gap-2">
								<div
									className="h-2 w-2 rounded-full"
									style={{
										backgroundColor: grp.researchTopicId ? (researchTopicColors?.[grp.researchTopicId] || '#6b7280') : '#6b7280'
									}}
								></div>
								<span className="text-neutral-900 font-medium text-[13px]">{grp.epic}</span>
							</div>
							<div className="ml-auto px-1 py-1">
								<SegmentedTabs
									options={[
										{ value: 'all', label: 'All' },
										{ value: 'todo', label: 'To do' },
										{ value: 'in_progress', label: 'In progress' },
										{ value: 'review', label: 'In Review' },
										{ value: 'done', label: 'Done' },
									] as { value: SegmentedOptionValue; label: string }[]}
									selected={(groupStatus[key] ?? 'in_progress') as SegmentedOptionValue}
									onChange={(val: SegmentedOptionValue) => setGroupTab(key, val as StatusFilter)}
									size="compact"
								/>
							</div>
						</li>
						{!isCollapsed && grp.items
							.filter((p) => {
								const tab = groupStatus[key] ?? 'in_progress';
								if (tab === 'all') return true;
								return (p.status as StatusFilter) === tab;
							})
							.map((p) => (
								<TicketItem
									key={p.id}
									ticket={p}
									subTickets={p.children}
									level={p.level || 0}
								/>
							))}
					</React.Fragment>
				);
			})}
		</>
	);
}
