"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import TicketList from '../../components/organisms/TicketList';
import TicketContent from '../../components/organisms/TicketContent';
import TicketDetailOverlay from '../../components/organisms/TicketDetailOverlay';
import { ticketsPageMockData } from '../../data/mockData';

export default function TicketPage() {
	const [ticketsData, setTicketsData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [rightView, setRightView] = useState<'kanban' | 'timeline'>('kanban');
	const [selected, setSelected] = useState<any>(null);
	const [creatingEpic, setCreatingEpic] = useState<string | null>(null);
	const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
	const searchParams = useSearchParams();

	// データ取得
	useEffect(() => {
		const fetchTickets = async () => {
			try {
				setLoading(true);
				
				const response = await fetch('/api/tickets/all');
				
				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Failed to fetch tickets: ${response.status} ${errorText}`);
				}
				
				const result = await response.json();
				
				if (!result.data) {
					throw new Error('No data in API response');
				}
				
				setTicketsData(result.data);
			} catch (err) {
				console.error('Error fetching tickets:', err);
				setError(err instanceof Error ? err : new Error('Unknown error'));
				
				// エラー時はモックデータを使用
				setTicketsData(ticketsPageMockData.parents);
			} finally {
				setLoading(false);
			}
		};

		fetchTickets();

		// データ更新イベントを監視
		const handleDataUpdate = () => {
			fetchTickets();
		};

		window.addEventListener('ticketDataUpdated', handleDataUpdate);
		
		return () => {
			window.removeEventListener('ticketDataUpdated', handleDataUpdate);
		};
	}, []);

	// クエリのslug指定がある場合、一覧データから対象を選択して詳細オーバーレイを開く
	useEffect(() => {
		const slug = searchParams.get('slug');
		if (!slug || ticketsData.length === 0) return;
		const found = ticketsData.flatMap((g: any) => g.list).find((g: any) => g.parent?.slug === slug);
		if (found) setSelected(found.parent);
	}, [searchParams, ticketsData]);

	// エピック別にグループ化
	const groupedByEpic = useMemo(() => {
		if (!ticketsData.length) {
			return [];
		}
		
		const result = ticketsData.map((group: any) => {
			if (!group || !group.epic || !group.list) {
				return null;
			}
			
			// リスト内のアイテムの安全性チェック
			const validList = group.list.filter((item: any) => {
				if (!item || !item.parent) {
					return false;
				}
				return true;
				});
			
			return {
				epic: group.epic,
				list: validList
			};
		}).filter((item: any): item is any => item !== null);
		
		return result;
	}, [ticketsData]);

	// 看板用のチケットデータ（アクティブなチケットのみ）
	const kanbanTickets = useMemo(() => {
		const allTickets = ticketsData.flatMap((g: any) => g.list);
		
		const activeTickets = allTickets.filter((g: any) => {
			return g.parent && g.parent.is_active === true;
		});
		
		return activeTickets.map((g: any) => ({
			id: g.parent.id,
			title: g.parent.title,
			user: g.parent.user,
			slug: g.parent.slug,
			status: g.parent.status,
			priority: g.parent.priority,
			commentsCount: g.parent.commentsCount,
			updatedAt: g.parent.updatedAt,
			epic: g.parent.epic,
			children: g.children || [] // サブチケットを含める
		}));
	}, [ticketsData]);

	// ハンドラー関数
	const handleSelect = (ticket: any) => setSelected(ticket);
	const handleClose = () => {
		setSelected(null);
		setCreatingEpic(null);
	};
	const handleCreateEpic = (epic: string) => setCreatingEpic(epic);
	const handleViewChange = (view: 'kanban' | 'timeline') => setRightView(view);
	
	// チケットアクティブ化のハンドラー
	const handleTicketActivate = async (ticketId: string, isActive: boolean) => {
		try {
			const response = await fetch('/api/tickets/update-active', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ticketId, isActive }),
			});

			if (!response.ok) {
				throw new Error('Failed to update ticket active status');
			}

			// 成功したらデータを再取得して看板を更新
			const refreshResponse = await fetch('/api/tickets/all');
			if (refreshResponse.ok) {
				const result = await refreshResponse.json();
				if (result.data) {
					setTicketsData(result.data);
				}
			}
		} catch (error) {
			console.error('Error updating ticket active status:', error);
		}
	};

	// サブタスクの状態更新ハンドラー
	const handleSubtaskStatusUpdate = async (subtaskId: string, status: 'todo' | 'active' | 'completed') => {
		try {
			const response = await fetch('/api/subtasks/update-status', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ subtaskId, status }),
			});

			if (!response.ok) {
				const responseText = await response.text();
				throw new Error(`Failed to update subtask status: ${response.status} ${responseText}`);
			}

			// 成功したらデータを再取得して看板を更新
			const refreshResponse = await fetch('/api/tickets/all');
			if (refreshResponse.ok) {
				const result = await refreshResponse.json();
				if (result.data) {
					setTicketsData(result.data);
				}
			}
		} catch (error) {
			// エラーハンドリング
		}
	};

	// todoの完了状態更新ハンドラー
	const handleTodoToggle = async (subtaskId: string, todoId: string, done: boolean) => {
		try {
			// APIは既にTicketKanbanで呼び出されているので、
			// ここではデータの再取得のみを行う
			const refreshResponse = await fetch('/api/tickets/all');
			if (refreshResponse.ok) {
				const result = await refreshResponse.json();
				if (result.data) {
					setTicketsData(result.data);
				}
			}
		} catch (error) {
			// エラーハンドリング
		}
	};



	// ローディング状態
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-neutral-600">Loading tickets...</div>
			</div>
		);
	}

	// エラー時はモックデータを使用（既にuseEffectで設定済み）
	if (error) {
		console.warn('Using mock data due to error:', error);
	}

	return (
		<div className="flex h-screen">
			{/* 左パネル - 収納可能 */}
			<div className={`transition-all duration-300 ease-in-out ${
				isLeftPanelCollapsed ? 'w-0 overflow-hidden' : 'w-[30%]'
			}`}>
				<TicketList 
					groupedByEpic={groupedByEpic}
					onSelect={handleSelect}
					onCreateEpic={handleCreateEpic}
					isCollapsed={isLeftPanelCollapsed}
				/>
			</div>
			
			{/* 右パネル */}
			<div className={`flex-1 relative transition-all duration-300 ease-in-out`}>
				<TicketContent 
					rightView={rightView}
					onViewChange={handleViewChange}
					kanbanTickets={kanbanTickets}
					isLeftPanelCollapsed={isLeftPanelCollapsed}
					onToggleLeftPanel={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
					onTicketActivate={handleTicketActivate}
					onSubtaskStatusUpdate={handleSubtaskStatusUpdate}
					onTodoToggle={handleTodoToggle}
				/>
				
				<TicketDetailOverlay 
					selected={selected}
					creatingEpic={creatingEpic}
					onClose={handleClose}
					ticketsData={ticketsData}
				/>
			</div>
		</div>
	);
} 