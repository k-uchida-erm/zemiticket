'use client';

import React, { useMemo } from 'react';
import { Ticket } from '../../../types';
import LoadingSpinner from '../../atoms/LoadingSpinner';
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
	isLoading: boolean;
	researchTopicColors?: Record<string, string>;
}

type EpicGroup = { epic: string; items: Ticket[] };

export default function TicketListSection({
	activeGroups,
	submittingTickets,
	othersGrouped,
	isLoading,
	researchTopicColors
}: TicketListSectionProps): React.ReactElement {
	const _parents: Ticket[] = useMemo<Ticket[]>(() => {
		const byId: Map<string, Ticket> = new Map<string, Ticket>();
		activeGroups.forEach((g: ActiveGroup) => {
			g.tickets.forEach((ticket: Ticket) => {
				byId.set(ticket.id, ticket);
			});
		});
		submittingTickets.forEach((t: Ticket) => {
			byId.set(t.id, t);
		});
		return Array.from(byId.values());
	}, [activeGroups, submittingTickets]);

	const groupByEpic = (items: Ticket[]): EpicGroup[] => {
		const map = new Map<string, Ticket[]>();
		items.forEach((p: Ticket) => {
						const key = p.research_topic_id ?? '未分類';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(p);
		});
		return Array.from(map.entries()).map(([epic, vals]) => ({ epic, items: vals }));
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
			<div className="divide-y divide-neutral-100">
				{isLoading ? (
					<div className="flex items-center justify-center py-10"><LoadingSpinner /></div>
				) : (
					<ul className="relative">
						{/* My section */}
						<EpicSection epicGroups={myGroups} sectionTitle="My" researchTopicColors={researchTopicColors} />

						{/* spacer between My and Others */}
						<li aria-hidden className="h-3" />

						{/* Others section */}
						<EpicSection epicGroups={otherGroups} sectionTitle="Others" researchTopicColors={researchTopicColors} />
					</ul>
				)}
			</div>
		</section>
	);
}
