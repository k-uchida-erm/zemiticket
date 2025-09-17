'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import PageHeader from '../../components/atoms/PageHeader';
import NewHomeLayout from '../../components/templates/NewHomeLayout';
import { useAuth } from '../../contexts/AuthContext';
import { HomeApiResponse } from '../../types';

export default function AllTicketsPage(): React.ReactElement {
	const [homeData, setHomeData] = useState<HomeApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isAuthenticated, currentWorkspace } = useAuth();

	useEffect(() => {
		const fetchHomeData = async () => {
			if (!isAuthenticated || !user || !currentWorkspace) {
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch(`/api/home?scope=all&userId=${user.id}&workspaceId=${currentWorkspace.id}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data: HomeApiResponse = await response.json();
				setHomeData(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unknown error occurred');
				console.error('Failed to fetch home data:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchHomeData();
	}, [isAuthenticated, user, currentWorkspace]);

  if (!isAuthenticated || !user || !currentWorkspace) {
          return <></>;
  }

	if (isLoading) {
		return <LoadingSpinner message="全チケットを読み込み中..." fullScreen />;
	}

	if (error) {
		return (
			<div className="h-screen w-full bg-white text-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<div className="text-lg font-medium text-red-600">エラーが発生しました</div>
					<div className="text-sm text-neutral-500 mt-2">{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen w-full bg-white text-neutral-900">
			<div className="h-full">
				<div className="h-full">
					{/* Main Content */}
					<div className="min-h-full pt-4 pl-2 pr-4">
						<PageHeader title="All Tickets" />
						<NewHomeLayout
							activeGroups={homeData?.activeGroups || []}
							submittingTickets={homeData?.submittingTickets || []}
							othersGrouped={homeData?.othersGrouped || []}
							isLoading={isLoading}
							researchTopicColors={homeData?.researchTopicColors || {}}
							onStatusChange={() => {}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
