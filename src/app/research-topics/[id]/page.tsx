'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import { SegmentedOptionValue } from '../../../components/atoms/SegmentedTabs';
import TicketItem from '../../../components/molecules/EpicSection/TicketItem';
import ResearchTopicHeader from '../../../components/molecules/ResearchTopicHeader';
import ResearchTopicsTemplate from '../../../components/templates/ResearchTopicsTemplate';
import { useAuth } from '../../../contexts/AuthContext';
import { computeAggregateStatusForChildren } from '../../../lib/utils/ticketStatusUtils';
import { HomeApiResponse, Ticket } from '../../../types';

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'review' | 'done';

interface ResearchTopicPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ResearchTopicPage({ params }: ResearchTopicPageProps): React.ReactElement {
	const resolvedParams = use(params);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [researchTopic, setResearchTopic] = useState<{ id: string; name: string; color: string } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('in_progress');
	const { user, isAuthenticated, currentWorkspace } = useAuth();

	const fetchResearchTopicData = useCallback(async () => {
		if (!isAuthenticated || !user || !currentWorkspace) {
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// 研究テーマ情報を取得
			const sidebarResponse = await fetch(`/api/sidebar?workspaceId=${currentWorkspace.id}`);
			if (!sidebarResponse.ok) {
				throw new Error(`Failed to fetch sidebar data: ${sidebarResponse.status}`);
			}
			const sidebarData = await sidebarResponse.json();

			const topic = sidebarData.researchTopics?.find((t: { id: string }) => t.id === resolvedParams.id);
			if (!topic) {
				throw new Error('Research topic not found');
			}
			setResearchTopic(topic);

			// チケットデータを取得
			const homeResponse = await fetch(`/api/home?scope=all&userId=${user.id}&workspaceId=${currentWorkspace.id}`);
			if (!homeResponse.ok) {
				throw new Error(`Failed to fetch home data: ${homeResponse.status}`);
			}
			const homeData: HomeApiResponse = await homeResponse.json();

			// 該当する研究テーマのチケットのみをフィルタリング
			const filteredTickets: Ticket[] = [];

			// activeGroupsから該当する研究テーマのチケットを取得
			if (homeData.activeGroups) {
				homeData.activeGroups.forEach(group => {
					if (group.researchTopicId === resolvedParams.id) {
						filteredTickets.push(...group.tickets);
					}
				});
			}

			// submittingTicketsから該当する研究テーマのチケットを取得
			if (homeData.submittingTickets) {
				homeData.submittingTickets.forEach(ticket => {
					if (ticket.research_topic_id === resolvedParams.id) {
						filteredTickets.push(ticket);
					}
				});
			}

			// othersGroupedから該当する研究テーマのチケットを取得
			if (homeData.othersGrouped) {
				homeData.othersGrouped.forEach(group => {
					if (group.tickets) {
						group.tickets.forEach(ticket => {
							if (ticket.research_topic_id === resolvedParams.id) {
								filteredTickets.push(ticket);
							}
						});
					}
				});
			}

			setTickets(filteredTickets);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unknown error occurred');
			if (process.env.NODE_ENV === 'development') {
				console.error('Failed to fetch research topic data:', err);
			}
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated, user, currentWorkspace, resolvedParams.id]);

	const handleStatusChange = useCallback(async (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done', affectedIds?: string[]) => {
		if (process.env.NODE_ENV === 'development') {
			console.log('[ResearchTopic] onStatusChange', { ticketId, newStatus, affectedIds });
		}
		// 楽観的更新（UIのみ即時更新）: ネストされたchildrenも含めて更新
		const ids = new Set<string>([ticketId, ...(affectedIds || [])]);
		const updateNode = (node: Ticket): Ticket => {
			const updatedSelf = ids.has(node.id) ? { ...node, status: newStatus } : node;
			if (updatedSelf.children && updatedSelf.children.length > 0) {
				return {
					...updatedSelf,
					children: updatedSelf.children.map((c: Ticket) => updateNode(c))
				};
			}
			return updatedSelf;
		};
		const applyOptimistic = (list: Ticket[]): Ticket[] => list.map((t) => updateNode(t));

		// 親の即時反映（共通関数で判定を統一）
		const recomputeParents = (node: Ticket): Ticket => {
			if (node.children && node.children.length > 0) {
				const nextChildren = node.children.map((c: Ticket) => recomputeParents(c));
				const nextStatus = computeAggregateStatusForChildren(nextChildren) as Ticket['status'];
				return { ...node, status: nextStatus, children: nextChildren } as Ticket;
			}
			return node;
		};

		setTickets((prev) => {
			const afterChild = applyOptimistic(prev);
			return afterChild.map((t) => recomputeParents(t));
		});

		try {
			if (process.env.NODE_ENV === 'development') {
				console.log('[ResearchTopic] POST update-status');
			}
			const res = await fetch('/api/tickets/update-status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticketId,
					status: newStatus,
					bulkUpdate: !!(affectedIds && affectedIds.length),
					affectedTicketIds: affectedIds || []
				})
			});
			if (res.ok) {
				const payload = await res.json();
				const ancestors: Array<{ id: string; status: 'todo' | 'in_progress' | 'done' }> = payload.updatedAncestors || [];
				if (ancestors.length > 0) {
					setTickets((prev) => {
						const byId = new Map(prev.map((t) => [t.id, t]));
						for (const a of ancestors) {
							const target = byId.get(a.id);
							if (target) target.status = a.status as Ticket['status'];
						}
						return prev.map((t) => ({ ...t }));
					});
				}
			}
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Failed to update ticket status:', error);
			}
		}
	}, []);

	useEffect(() => {
		fetchResearchTopicData();
	}, [isAuthenticated, user, currentWorkspace, resolvedParams.id, fetchResearchTopicData]);

	if (!isAuthenticated || !user || !currentWorkspace) {
		return <></>;
	}

	if (isLoading || !researchTopic) {
		return <LoadingSpinner message="研究テーマの詳細を読み込み中..." fullScreen />;
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

	const filteredTickets = tickets.filter(ticket => {
		if (statusFilter === 'all') return true;
		return ticket.status === statusFilter;
	});

	// 子孫まで含めてフラット化（兄弟取得のため）
	const flattenTickets = (list: Ticket[]): Ticket[] => {
		const acc: Ticket[] = [];
		const walk = (node: Ticket) => {
			acc.push(node);
			if (node.children && node.children.length > 0) {
				node.children.forEach((c: Ticket) => walk(c));
			}
		};
		list.forEach((t) => walk(t));
		return acc;
	};

	// 兄弟判定はフィルタ前の全データで行う必要がある
	const flatAllTickets = flattenTickets(tickets);

	return (
		<ResearchTopicsTemplate
			header={<ResearchTopicHeader name={researchTopic?.name || '研究テーマ'} color={researchTopic?.color || '#6b7280'} />}
			segmented={{
				options: [
					{ value: 'all', label: 'All' },
					{ value: 'todo', label: 'To do' },
					{ value: 'in_progress', label: 'In progress' },
					{ value: 'review', label: 'In Review' },
					{ value: 'done', label: 'Done' },
				] as { value: SegmentedOptionValue; label: string }[],
				selected: statusFilter as SegmentedOptionValue,
				onChange: (val: SegmentedOptionValue) => setStatusFilter(val as StatusFilter),
				size: 'compact'
			}}
		>
			<div className="divide-y divide-neutral-100">
				{filteredTickets.length === 0 ? (
					<div className="flex items-center justify-center py-8 px-2 text-neutral-500">チケットがありません</div>
				) : (
					<ul className="relative">
						{filteredTickets.map((ticket) => (
							<TicketItem
								key={ticket.id}
								ticket={ticket}
								subTickets={ticket.children}
								level={ticket.level || 0}
								onStatusChange={handleStatusChange}
								allTickets={flatAllTickets}
							/>
						))}
					</ul>
				)}
			</div>
		</ResearchTopicsTemplate>
	);
}
