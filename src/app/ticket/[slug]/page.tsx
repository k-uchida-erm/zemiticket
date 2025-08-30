"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TicketDetailPanel from '../../../components/organisms/TicketDetailPanel';
import type { ParentTask, SubTask } from '../../../types';

interface TicketData {
	epic: string;
	list: Array<{
		parent: ParentTask;
		children: SubTask[];
	}>;
}

export default function TicketDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [ticket, setTicket] = useState<ParentTask | null>(null);
	const [subtasks, setSubtasks] = useState<SubTask[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTicketData = async () => {
			try {
				const slug = params.slug;
				if (!slug) return;

				// DBからチケットデータを取得
				const response = await fetch('/api/tickets/all');
				if (!response.ok) {
					throw new Error('Failed to fetch tickets');
				}

				const result = await response.json();
				if (!result.data || !Array.isArray(result.data)) {
					throw new Error('Invalid data format');
				}

				// slugからチケットを検索
				const allTickets: TicketData[] = result.data;
				let foundTicket: ParentTask | null = null;
				let foundSubtasks: SubTask[] = [];

				for (const epicGroup of allTickets) {
					for (const ticketItem of epicGroup.list) {
						if (ticketItem.parent && ticketItem.parent.slug === slug) {
							foundTicket = ticketItem.parent;
							foundSubtasks = ticketItem.children || [];
							break;
						}
					}
					if (foundTicket) break;
				}

				if (foundTicket) {
					setTicket(foundTicket);
					setSubtasks(foundSubtasks);
				} else {
					setError('Ticket not found');
				}
			} catch (err) {
				console.error('Error fetching ticket data:', err);
				setError('Failed to load ticket data');
			} finally {
				setLoading(false);
			}
		};

		fetchTicketData();
	}, [params.slug]);

	const handleClose = () => {
		router.push('/ticket');
	};

	const handleToggleFullscreen = () => {
		router.push('/ticket');
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-neutral-600">Loading ticket...</div>
			</div>
		);
	}

	if (error || !ticket) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-neutral-600">{error || 'Ticket not found'}</div>
			</div>
		);
	}

	return (
		<div 
			className="h-screen bg-white" 
			style={{ 
				height: '100vh', 
				overflowY: 'auto',
				overflowX: 'hidden'
			}}
		>
			<div className="flex h-full">
				{/* 左側: チケット詳細 */}
				<div className="flex-1 max-w-4xl px-6 py-8">
					<TicketDetailPanel 
						parent={ticket} 
						subtasks={subtasks} 
						onClose={handleClose} 
						onSave={() => handleClose()} 
						onToggleFullscreen={handleToggleFullscreen}
						isFullscreen={true}
					/>
				</div>
				
				{/* 右側: 追加コンテンツ */}
				<div className="w-80 bg-neutral-50 border-l border-neutral-200 p-6">
					<div className="space-y-6">
						{/* チケット概要 */}
						<div className="bg-white rounded-lg p-4 border border-neutral-200">
							<h3 className="text-sm font-semibold text-neutral-800 mb-3">Ticket Overview</h3>
							<div className="space-y-2 text-xs text-neutral-600">
								<div className="flex justify-between">
									<span>Status:</span>
									<span className="font-medium">{ticket.status || 'Not set'}</span>
								</div>
								<div className="flex justify-between">
									<span>Priority:</span>
									<span className="font-medium">{ticket.priority || 'Not set'}</span>
								</div>
								<div className="flex justify-between">
									<span>Epic:</span>
									<span className="font-medium">{ticket.epic || 'Not set'}</span>
								</div>
								{ticket.estimateHours && (
									<div className="flex justify-between">
										<span>Estimate:</span>
										<span className="font-medium">{ticket.estimateHours}h</span>
									</div>
								)}
								{ticket.due && (
									<div className="flex justify-between">
										<span>Due:</span>
										<span className="font-medium">{ticket.due}</span>
									</div>
								)}
							</div>
						</div>

						{/* 進捗サマリー */}
						<div className="bg-white rounded-lg p-4 border border-neutral-200">
							<h3 className="text-sm font-semibold text-neutral-800 mb-3">Progress Summary</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-xs text-neutral-600">Overall Progress</span>
									<span className="text-sm font-semibold text-neutral-800">
										{ticket.progressPercentage || 0}%
									</span>
								</div>
								<div className="w-full bg-neutral-200 rounded-full h-2">
									<div 
										className="h-full bg-[#00b393] transition-all rounded-full"
										style={{ width: `${ticket.progressPercentage || 0}%` }}
									/>
								</div>
								<div className="text-xs text-neutral-500">
									{subtasks.length} subtasks • {subtasks.filter(s => s.status === 'done').length} completed
								</div>
							</div>
						</div>

						{/* 最近のアクティビティ */}
						<div className="bg-white rounded-lg p-4 border border-neutral-200">
							<h3 className="text-sm font-semibold text-neutral-800 mb-3">Recent Activity</h3>
							<div className="space-y-2 text-xs text-neutral-600">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-[#00b393] rounded-full"></div>
									<span>Ticket created</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span>Subtasks added</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
									<span>Progress updated</span>
								</div>
							</div>
						</div>

						{/* クイックアクション */}
						<div className="bg-white rounded-lg p-4 border border-neutral-200">
							<h3 className="text-sm font-semibold text-neutral-800 mb-3">Quick Actions</h3>
							<div className="space-y-2">
								<button className="w-full px-3 py-2 text-xs bg-[#00b393] text-white rounded-md hover:bg-[#00a085] transition-colors">
									Add Subtask
								</button>
								<button className="w-full px-3 py-2 text-xs bg-white border border-[#00b393] text-[#00b393] rounded-md hover:bg-[#00b393]/5 transition-colors">
									Request Review
								</button>
								<button className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 text-neutral-600 rounded-md hover:bg-neutral-50 transition-colors">
									Export Data
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 