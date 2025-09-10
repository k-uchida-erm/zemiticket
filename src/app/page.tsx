'use client';

import React, { useEffect, useState } from 'react';
import NewHomeLayout from '../components/templates/NewHomeLayout';
import { Ticket } from '../types';

interface ActiveGroup {
	epic: string;
	researchTopicId?: string | null;
	tickets: Ticket[];
}

interface OthersGroup {
	user: string;
	tickets: Ticket[];
}

interface HomeApiResponse {
	activeGroups: ActiveGroup[];
	submittingTickets: Ticket[];
	othersGrouped: OthersGroup[];
	researchTopicColors?: Record<string, string>;
}

export default function Home(): React.ReactElement {
	const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
	const [submittingTickets, setSubmittingTickets] = useState<Ticket[]>([]);
	const [othersGrouped, setOthersGrouped] = useState<OthersGroup[]>([]);
	const [researchTopicColors, setResearchTopicColors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);


	useEffect(() => {
		const fetchHomeData = async (): Promise<void> => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/home');
				if (!response.ok) {
					throw new Error('Failed to fetch home data');
				}
				const result: HomeApiResponse = await response.json();
				setActiveGroups(result.activeGroups ?? []);
				setSubmittingTickets(result.submittingTickets ?? []);
				setOthersGrouped(result.othersGrouped ?? []);
				setResearchTopicColors(result.researchTopicColors ?? {});
			} catch {
				// noop
			} finally {
				setIsLoading(false);
			}
		};

		fetchHomeData();
	}, []);

	return (
		<NewHomeLayout
			activeGroups={activeGroups}
			submittingTickets={submittingTickets}
			othersGrouped={othersGrouped}
			isLoading={isLoading}
			researchTopicColors={researchTopicColors}
		/>
	);
}
