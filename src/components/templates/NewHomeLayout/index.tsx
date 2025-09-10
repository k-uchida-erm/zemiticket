'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ticket } from '../../../types';
import SectionTitle from '../../atoms/SectionTitle';
import SegmentedTabs, { SegmentedOptionValue } from '../../atoms/SegmentedTabs';
import TicketListSection from '../../molecules/TicketListSection';

interface ActiveGroup {
	epic: string;
	researchTopicId?: string | null;
	tickets: Ticket[];
}

interface OthersGroup {
	user: string;
	tickets: Ticket[];
}

interface NewHomeLayoutProps {
	activeGroups: ActiveGroup[];
	submittingTickets: Ticket[];
	othersGrouped: OthersGroup[];
	isLoading: boolean;
	researchTopicColors?: Record<string, string>;
}

export default function NewHomeLayout({
	activeGroups,
	submittingTickets,
	othersGrouped,
	isLoading,
	researchTopicColors
}: NewHomeLayoutProps): React.ReactElement {
	const [assignFilter, setAssignFilter] = useState<'MY' | 'ALL'>('MY');
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async (): Promise<void> => {
			try {
				const res = await fetch('/api/sidebar');
				if (!res.ok) return;
				const data = await res.json();
				if (data?.currentUser?.id) {
					setCurrentUserId(data.currentUser.id as string);
				}
			} catch {
				// noop
			}
		};
		fetchUser();
	}, []);

	const filteredActiveGroups = useMemo(() => {
		if (assignFilter === 'ALL' || !currentUserId) return activeGroups;
		return activeGroups
			.map(g => ({
				epic: g.epic,
				researchTopicId: g.researchTopicId,
				tickets: g.tickets.filter(t => t.user_id === currentUserId),
			}))
			.filter(g => g.tickets.length > 0); // 空のチケット配列を持つ研究テーマを除外
	}, [activeGroups, assignFilter, currentUserId]);

	const filteredSubmitting = useMemo(() => {
		if (assignFilter === 'ALL' || !currentUserId) return submittingTickets;
		return submittingTickets.filter(t => t.user_id === currentUserId);
	}, [submittingTickets, assignFilter, currentUserId]);

	const filteredOthersGrouped = useMemo(() => {
		if (assignFilter === 'ALL' || !currentUserId) return othersGrouped;
		return othersGrouped
			.map(g => ({
				user: g.user,
				tickets: g.tickets.filter(t => t.user_id !== null && t.user_id !== currentUserId),
			}))
			.filter(g => g.tickets.length > 0); // 空のチケット配列を持つグループを除外
	}, [othersGrouped, assignFilter, currentUserId]);

	return (
		<div className="h-screen w-full bg-white text-neutral-900">
			<div className="h-full">
				<div className="h-full">
					{/* Main Content */}
					<div className="min-h-full pt-4 pl-2 pr-4">
						<div className="flex items-center gap-3">
							<SectionTitle>tickets</SectionTitle>
							<div className="flex items-center gap-2">
								<SegmentedTabs
								options={[
									{ value: 'MY', label: 'MY' },
									{ value: 'ALL', label: 'ALL' },
								] as { value: SegmentedOptionValue; label: string }[]}
									selected={assignFilter as SegmentedOptionValue}
									onChange={(val: SegmentedOptionValue) => setAssignFilter(val as 'MY' | 'ALL')}
									variant="filled"
								/>
								<button className="h-6 w-6 rounded border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-50">
									<svg className="h-3 w-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
									</svg>
								</button>
							</div>
						</div>
						<TicketListSection
							activeGroups={filteredActiveGroups}
							submittingTickets={filteredSubmitting}
							othersGrouped={filteredOthersGrouped}
							isLoading={isLoading}
							researchTopicColors={researchTopicColors}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
