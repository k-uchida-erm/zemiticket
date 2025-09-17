'use client';

import React, { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import PageHeader from '../../components/atoms/PageHeader';
import NewHomeLayout from '../../components/templates/NewHomeLayout';
import ResearchTopicsTemplate from '../../components/templates/ResearchTopicsTemplate';
import { useAuth } from '../../contexts/AuthContext';
import { computeAggregateStatusFromStatuses, TicketStatus } from '../../lib/utils/ticketStatusUtils';
import { HomeApiResponse } from '../../types';

export default function ResearchTopicsPage(): React.ReactElement {
	const [homeData, setHomeData] = useState<HomeApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isAuthenticated, currentWorkspace } = useAuth();

	const fetchHomeData = useCallback(async () => {
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
	}, [isAuthenticated, user, currentWorkspace]);

	const handleStatusChange = async (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done', affectedIds?: string[]) => {
		// 楽観的更新：homeData内の該当チケットのstatusを書き換える
		setHomeData((prev) => {
			if (!prev) return prev;
			const ids = new Set<string>([ticketId, ...(affectedIds || [])]);
			const updateArray = (arr: Array<{ id: string; status: string }> | undefined) =>
				(arr || []).map((t: any) => (ids.has(t.id) ? { ...t, status: newStatus } : t));
			// まず対象チケットの楽観的更新を適用
			const next = {
				...prev,
				activeGroups: (prev.activeGroups || []).map((g) => ({
					...g,
					tickets: updateArray(g.tickets) as any
				})),
				submittingTickets: updateArray(prev.submittingTickets) as any,
				othersGrouped: (prev.othersGrouped || []).map((g) => ({
					...g,
					tickets: updateArray(g.tickets) as any
				}))
			};

			// 親の即時再計算（全done→done、全todo→todo、その他→in_progress）を祖先まで反復
			const collectAll = (): Array<{ id: string; status: TicketStatus; parent_id?: string | null }> => {
				const a = (next.activeGroups || []).flatMap((g) => (g.tickets as any[] | undefined) || []);
				const b = ((next.submittingTickets as any[] | undefined) || []);
				const c = (next.othersGrouped || []).flatMap((g) => (g.tickets as any[] | undefined) || []);
				return [...a, ...b, ...c] as Array<{ id: string; status: TicketStatus; parent_id?: string | null }>;
			};
			const all = collectAll();
			const statusMap = new Map<string, TicketStatus>();
			const parentMap = new Map<string, string | null | undefined>();
			for (const t of all) {
				statusMap.set(t.id, t.status as TicketStatus);
				parentMap.set(t.id, (t as any).parent_id as string | null | undefined);
			}

			let changed = true;
			while (changed) {
				changed = false;
				// parent_id -> child statuses
				const childrenStatuses = new Map<string, TicketStatus[]>();
				for (const t of all) {
					const pid = (t as any).parent_id as string | null | undefined;
					if (!pid) continue;
					const arr = childrenStatuses.get(pid) || [];
					arr.push(statusMap.get(t.id) as TicketStatus);
					childrenStatuses.set(pid, arr);
				}
				for (const [pid, statuses] of childrenStatuses.entries()) {
					const nextStatus = computeAggregateStatusFromStatuses(statuses);
					const current = statusMap.get(pid);
					if (current && current !== nextStatus) {
						statusMap.set(pid, nextStatus);
						changed = true;
					}
				}
			}

			const applyStatusMap = (arr: Array<{ id: string; status: string }> | undefined) =>
				(arr || []).map((t: any) => (statusMap.has(t.id) ? { ...t, status: statusMap.get(t.id) } : t));

			return {
				...next,
				activeGroups: (next.activeGroups || []).map((g) => ({ ...g, tickets: applyStatusMap(g.tickets) as any })),
				submittingTickets: applyStatusMap(next.submittingTickets) as any,
				othersGrouped: (next.othersGrouped || []).map((g) => ({ ...g, tickets: applyStatusMap(g.tickets) as any })),
			};
		});

		// 非同期でAPI更新し、updatedAncestorsをUIに即反映
		try {
			const res = await fetch('/api/tickets/update-status', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					ticketId,
					status: newStatus,
					bulkUpdate: !!(affectedIds && affectedIds.length),
					affectedTicketIds: affectedIds || []
				}),
			});
			if (res.ok) {
				const payload = await res.json();
				const ancestors: Array<{ id: string; status: 'todo' | 'in_progress' | 'done' }> = payload.updatedAncestors || [];
				if (ancestors.length > 0) {
					setHomeData((prev) => {
						if (!prev) return prev;
						const byId = new Map<string, 'todo' | 'in_progress' | 'done'>(ancestors.map(a => [a.id, a.status]));
						const apply = (arr: Array<{ id: string; status: string }> | undefined) =>
							(arr || []).map((t: any) => (byId.has(t.id) ? { ...t, status: byId.get(t.id) } : t));
						return {
							...prev,
							activeGroups: (prev.activeGroups || []).map(g => ({ ...g, tickets: apply(g.tickets) as any })),
							submittingTickets: apply(prev.submittingTickets) as any,
							othersGrouped: (prev.othersGrouped || []).map(g => ({ ...g, tickets: apply(g.tickets) as any })),
						};
					});
				}
			}
		} catch (error) {
			console.error('Failed to update ticket status:', error);
		}
	};

	useEffect(() => {
		fetchHomeData();
	}, [fetchHomeData]);

	if (!isAuthenticated || !user || !currentWorkspace) {
		return <></>;
	}

	if (isLoading) {
		return <LoadingSpinner message="研究テーマを読み込み中..." fullScreen />;
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
		<ResearchTopicsTemplate header={<PageHeader title="Research Topics" />}>
			<NewHomeLayout
				activeGroups={homeData?.activeGroups || []}
				submittingTickets={homeData?.submittingTickets || []}
				othersGrouped={homeData?.othersGrouped || []}
				isLoading={isLoading}
				researchTopicColors={homeData?.researchTopicColors || {}}
				onStatusChange={handleStatusChange}
			/>
		</ResearchTopicsTemplate>
	);
}
