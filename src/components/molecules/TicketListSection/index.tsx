'use client';

import React, { useMemo, useState } from 'react';
import { Ticket } from '../../../types';
import SegmentedTabs, { SegmentedOptionValue } from '../../atoms/SegmentedTabs';
import EpicSection from '../EpicSection';

interface ActiveGroup {
	epic: string;
	researchTopicId?: string | null;
	tickets: Ticket[];
}

interface OthersGroup {
	user: string;
	tickets: Ticket[];
}

interface TicketListSectionProps {
	activeGroups: ActiveGroup[];
	submittingTickets: Ticket[];
	othersGrouped: OthersGroup[];
	isLoading?: boolean;
	researchTopicColors?: Record<string, string>;
	onStatusChange?: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => void;
}

type EpicGroup = { epic: string; items: Ticket[]; researchTopicId?: string | null };
type StatusFilter = 'all' | 'todo' | 'in_progress' | 'review' | 'done';

export default function TicketListSection({
	activeGroups,
	submittingTickets,
	othersGrouped,
	isLoading: _isLoading = false,
	researchTopicColors,
	onStatusChange
}: TicketListSectionProps): React.ReactElement {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('in_progress');
	// 全てのチケットを取得（依存関係チェック用）
	const allTickets: Ticket[] = useMemo<Ticket[]>(() => {
		const byId: Map<string, Ticket> = new Map<string, Ticket>();

		// activeGroupsからチケットを取得
		activeGroups.forEach((g: ActiveGroup) => {
			g.tickets.forEach((ticket: Ticket) => {
				byId.set(ticket.id, ticket);
			});
		});

		// submittingTicketsからチケットを取得
		submittingTickets.forEach((t: Ticket) => {
			byId.set(t.id, t);
		});

		// othersGroupedからチケットを取得
		othersGrouped.forEach((group: OthersGroup) => {
			group.tickets.forEach((ticket: Ticket) => {
				byId.set(ticket.id, ticket);
			});
		});

		return Array.from(byId.values());
	}, [activeGroups, submittingTickets, othersGrouped]);

	const groupByEpic = (items: Ticket[]): EpicGroup[] => {
		const map = new Map<string, { items: Ticket[]; researchTopicId?: string | null }>();
		items.forEach((p: Ticket) => {
			const key = p.research_topic_id ?? '未分類';
			if (!map.has(key)) map.set(key, { items: [], researchTopicId: p.research_topic_id || null });
			map.get(key)!.items.push(p);
		});
		return Array.from(map.entries()).map(([epic, data]) => ({ epic, items: data.items, researchTopicId: data.researchTopicId }));
	};

	const myGroups = useMemo<EpicGroup[]>(() => {
		// activeGroupsをそのままEpicGroup形式に変換
		return activeGroups.map(group => ({
			epic: group.epic,
			researchTopicId: group.researchTopicId,
			items: group.tickets
		}));
	}, [activeGroups]);
	const otherGroups = useMemo<EpicGroup[]>(() => {
		const allTickets = othersGrouped.reduce((acc: Ticket[], group: OthersGroup) => {
			return [...acc, ...group.tickets];
		}, []);
		return groupByEpic(allTickets);
	}, [othersGrouped]);

	return (
		<section className="mb-0">
			{/* 共通のセグメントボタン */}
			<div className="flex justify-start mb-4 px-2 max-w-2xl">
				<SegmentedTabs
					options={[
						{ value: 'all', label: 'All' },
						{ value: 'todo', label: 'To do' },
						{ value: 'in_progress', label: 'In progress' },
						{ value: 'review', label: 'In Review' },
						{ value: 'done', label: 'Done' },
					] as { value: SegmentedOptionValue; label: string }[]}
					selected={statusFilter as SegmentedOptionValue}
					onChange={(val: SegmentedOptionValue) => setStatusFilter(val as StatusFilter)}
					size="compact"
				/>
			</div>

			<div className="divide-y divide-neutral-100">
				<ul className="relative">
					{/* My section */}
					<EpicSection
						epicGroups={myGroups}
						sectionTitle="My"
						researchTopicColors={researchTopicColors}
						statusFilter={statusFilter}
						onStatusChange={onStatusChange}
						allTickets={allTickets}
					/>

					{/* spacer between My and Others */}
					<li aria-hidden className="h-3" />

					{/* Others section */}
					<EpicSection
						epicGroups={otherGroups}
						sectionTitle="Others"
						researchTopicColors={researchTopicColors}
						statusFilter={statusFilter}
						onStatusChange={onStatusChange}
						allTickets={allTickets}
					/>
				</ul>
			</div>
		</section>
	);
}
