"use client";

import { useCallback, useMemo, useState } from 'react';
import ParentTicketCard from '../../molecules/ParentTicketCard';
import KanbanColumn from './KanbanColumn';
import SubmitButton from './SubmitButton';
import DeactivateButton from './DeactivateButton';
import DropZone from './DropZone';
import type { ParentTask, SubTask, SubTodo } from '../../../types';

interface TicketKanbanProps {
	tickets: ParentTask[];
	onTicketActivate?: (ticketId: string, isActive: boolean) => void;
	onSubtaskStatusUpdate?: (subtaskId: string, status: 'todo' | 'active' | 'completed') => void;
	onTodoToggle?: (subtaskId: string, todoId: string, done: boolean) => void;
}

interface KanbanTask extends ParentTask {
	subtasks?: SubTask[];
}

interface SubTicket {
	id: string | number;
	title: string;
	status: 'todo' | 'active' | 'completed';
	todos?: SubTodo[];
}

export default function TicketKanban({ tickets, onTicketActivate, onSubtaskStatusUpdate, onTodoToggle }: TicketKanbanProps) {
	
	const transformTickets = (tickets: ParentTask[]) => {
		return tickets.map((t: ParentTask) => ({
			...t,
			subtasks: t.children ? t.children.map((child: SubTask) => ({
				...child,
				todos: child.todos || []
			})) : []
		}));
	};
	
	const activeParentTickets: KanbanTask[] = useMemo(() => transformTickets(tickets), [tickets]);
	
	const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string | number>>(new Set());
	const [manuallyUpdatedSubtasks, setManuallyUpdatedSubtasks] = useState<Set<string | number>>(new Set());

	const onDragOver = useCallback((e: React.DragEvent) => { 
		e.preventDefault(); 
		e.dataTransfer.dropEffect = 'move'; 
	}, []);

	const onDropActiveParent = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		const raw = e.dataTransfer.getData('application/json');
		if (!raw) return;
		try {
			const data = JSON.parse(raw);
			if (data.kind === 'parent') {
				if (onTicketActivate) {
					onTicketActivate(data.id, true);
				}
			}
		} catch {}
	}, [onTicketActivate]);

	const onDropActiveSub = useCallback((e: React.DragEvent, targetStatus: 'todo' | 'active' | 'completed') => {
		e.preventDefault();
		const raw = e.dataTransfer.getData('application/json');
		if (!raw) return;
		try {
			const data = JSON.parse(raw);
			if (data.kind === 'subtask') {
				// 手動更新フラグを設定
				setManuallyUpdatedSubtasks(prev => new Set(prev).add(data.id));
				// サブチケットの状態を手動で更新（優先）
				if (onSubtaskStatusUpdate) {
					onSubtaskStatusUpdate(data.id, targetStatus);
				}
			}
		} catch {}
	}, [onSubtaskStatusUpdate]);

	const onDropCompletedSub = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		const raw = e.dataTransfer.getData('application/json');
		if (!raw) return;
		try {
			const data = JSON.parse(raw);
			if (data.kind === 'subtask') {
				// 手動更新フラグを設定
				setManuallyUpdatedSubtasks(prev => new Set(prev).add(data.id));
				// サブチケットの状態を手動で更新（優先）
				if (onSubtaskStatusUpdate) {
					onSubtaskStatusUpdate(data.id, 'completed');
				}
			}
		} catch {}
	}, [onSubtaskStatusUpdate]);

	const toggleSubtask = useCallback((subtaskId: string | number) => {
		setExpandedSubtasks(prev => {
			const newSet = new Set(prev);
			if (newSet.has(subtaskId)) {
				newSet.delete(subtaskId);
			} else {
				newSet.add(subtaskId);
			}
			return newSet;
		});
	}, []);

	// todoの完了状態を切り替える関数
	const handleTodoToggle = useCallback(async (subtaskId: string, todoId: string, done: boolean) => {
		try {
			const response = await fetch('/api/subtasks/update-todo-status', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subtaskId, todoId, done }),
			});

			if (!response.ok) {
				throw new Error('Failed to update todo status');
			}

			// 成功したら、親コンポーネントにデータ再取得を要求
			// これにより、最新の状態が反映される
			if (onTodoToggle) {
				onTodoToggle(subtaskId, todoId, done);
			}
		} catch (error) {
			// エラーハンドリング
		}
	}, [onTodoToggle]);

	return (
		<div className="space-y-4 pb-16">
			{/* アクティブ親チケットエリア */}
			{activeParentTickets.length > 0 && (
				<div className="space-y-3">
					{activeParentTickets.map((ticket) => {
						const allCompleted = Boolean(ticket.subtasks && ticket.subtasks.length > 0 && 
							ticket.subtasks.every(subtask => subtask.status === 'done'));

						return (
							<ParentTicketCard
								key={ticket.id}
								parent={{
									id: ticket.id,
									title: ticket.title,
									description: ticket.description || '',
									status: ticket.status || 'todo',
									priority: ticket.priority || 'medium',
									epic: ticket.epic || '',
									due: ticket.due || '',
									estimateHours: ticket.estimateHours || 0,
									progressPercentage: ticket.progressPercentage || 0,
									slug: ticket.slug || '',
									user: ticket.user || '',
									commentsCount: ticket.commentsCount || 0,
									updatedAt: ticket.updatedAt || '',
								}}
								subtasks={[]}
								expanded={true}
								onToggle={undefined}
								size="md"
								renderSubticketsInside={true}
								hideProgress={true}
								hideDue={true}
								hideEpic={true}
								hideIcon={false}
								childrenReadOnly={false}
								customSubtasksContent={ticket.subtasks ? (
									<div className="mt-6">
										{/* Submitボタンと非アクティブボタンを右上に配置 */}
										<div className="absolute top-4 right-8 z-10 flex gap-2">
											<SubmitButton allCompleted={allCompleted} />
											<DeactivateButton 
												onDeactivate={() => onTicketActivate?.(ticket.id.toString(), false)} 
											/>
										</div>
										
										<div className="grid grid-cols-3 divide-x divide-neutral-200">
											<KanbanColumn
												status="todo"
												subtasks={ticket.subtasks}
												expandedSubtasks={expandedSubtasks}
												manuallyUpdatedSubtasks={manuallyUpdatedSubtasks}
												onToggleSubtask={toggleSubtask}
												onDragOver={onDragOver}
												onDrop={(e) => onDropActiveSub(e, 'todo')}
												onSubtaskStatusUpdate={onSubtaskStatusUpdate}
												onTodoToggle={handleTodoToggle}
											/>
											<KanbanColumn
												status="active"
												subtasks={ticket.subtasks}
												expandedSubtasks={expandedSubtasks}
												manuallyUpdatedSubtasks={manuallyUpdatedSubtasks}
												onToggleSubtask={toggleSubtask}
												onDragOver={onDragOver}
												onDrop={(e) => onDropActiveSub(e, 'active')}
												onSubtaskStatusUpdate={onSubtaskStatusUpdate}
												onTodoToggle={handleTodoToggle}
											/>
											<KanbanColumn
												status="completed"
												subtasks={ticket.subtasks}
												expandedSubtasks={expandedSubtasks}
												manuallyUpdatedSubtasks={manuallyUpdatedSubtasks}
												onToggleSubtask={toggleSubtask}
												onDragOver={onDragOver}
												onDrop={(e) => onDropActiveSub(e, 'completed')}
												onSubtaskStatusUpdate={onSubtaskStatusUpdate}
												onTodoToggle={handleTodoToggle}
											/>
										</div>
									</div>
								) : undefined}
							/>
						);
					})}
				</div>
			)}
			
			{/* ドロップエリア */}
			<DropZone onDragOver={onDragOver} onDrop={onDropActiveParent} />
		</div>
	);
} 