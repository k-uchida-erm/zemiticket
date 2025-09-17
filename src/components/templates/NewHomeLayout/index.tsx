'use client';

import React from 'react';
import { Ticket } from '../../../types';
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
	onStatusChange?: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => void;
}

export default function NewHomeLayout({
	activeGroups,
	submittingTickets,
	othersGrouped,
	isLoading,
	researchTopicColors,
	onStatusChange
}: NewHomeLayoutProps): React.ReactElement {
	return (
		<div className="h-screen w-full bg-white text-neutral-900">
			<div className="h-full">
				<div className="h-full">
					{/* Main Content */}
					<div className="min-h-full pl-2 pr-4">
						<TicketListSection
							activeGroups={activeGroups}
							submittingTickets={submittingTickets}
							othersGrouped={othersGrouped}
							isLoading={isLoading}
							researchTopicColors={researchTopicColors}
							onStatusChange={onStatusChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
