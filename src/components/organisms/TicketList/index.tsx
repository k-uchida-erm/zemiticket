"use client";

import SectionTitle from '../../atoms/SectionTitle';
import IconList from '../../atoms/icons/List';
import EmptyState from '../../atoms/EmptyState';
import ScrollableContainer from '../../atoms/ScrollableContainer';
import TicketListContainer from '../../molecules/TicketListContainer';
import type { ParentTask, SubTask } from '../../types';

interface TicketGroup {
	epic: string;
	list: Array<{
		parent: ParentTask;
		children: SubTask[];
	}>;
}

interface TicketListProps {
	groupedByEpic: TicketGroup[];
	onSelect: (ticket: SubTask) => void;
	onCreateEpic: (epic: string) => void;
	isCollapsed: boolean;
	selectedTicketSlug?: string;
}

export default function TicketList({ groupedByEpic, onSelect, onCreateEpic, isCollapsed, selectedTicketSlug }: TicketListProps) {
	// データの安全性チェック
	if (!groupedByEpic || groupedByEpic.length === 0) {
		return (
			<ScrollableContainer className={`${isCollapsed ? 'w-full' : 'w-full'} space-y-2 ${isCollapsed ? 'px-1' : 'px-4'}`}>
				{!isCollapsed && (
					<section>
						<SectionTitle icon={<IconList />}>All tickets</SectionTitle>
					</section>
				)}
				{!isCollapsed && <EmptyState message="No tickets available" />}
			</ScrollableContainer>
		);
	}

	return (
		<ScrollableContainer className={`${isCollapsed ? 'w-full' : 'w-full'} space-y-2 ${isCollapsed ? 'px-1' : 'px-4'}`}>
			{!isCollapsed && (
				<section>
					<SectionTitle icon={<IconList />}>All tickets</SectionTitle>
				</section>
			)}
			{!isCollapsed && (
				<TicketListContainer
					groupedByEpic={groupedByEpic}
					onSelect={onSelect}
					onCreateEpic={onCreateEpic}
					selectedTicketSlug={selectedTicketSlug}
				/>
			)}
		</ScrollableContainer>
	);
} 
 
 
 