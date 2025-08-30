"use client";

import { useEffect } from 'react';
import IconChevronDown from '../../../atoms/icons/ChevronDown';
import TodoItem from '../TodoItem';
import type { SubTask, SubTodo } from '../../../../types';

interface KanbanSubtaskProps {
	subtask: SubTask;
	status: 'todo' | 'active' | 'completed';
	expanded: boolean;
	isManuallyUpdated: boolean;
	onToggle: () => void;
	onSubtaskStatusUpdate?: (subtaskId: string, status: 'todo' | 'active' | 'completed') => void;
	onTodoToggle?: (subtaskId: string, todoId: string, done: boolean) => void;
}

const statusStyles = {
	todo: {
		bgColor: 'bg-neutral-50',
		borderColor: 'border-neutral-200'
	},
	active: {
		bgColor: 'bg-orange-50',
		borderColor: 'border-orange-200'
	},
	completed: {
		bgColor: 'bg-[#00b393]/10',
		borderColor: 'border-[#00b393]/20'
	}
};

export default function KanbanSubtask({
	subtask,
	status,
	expanded,
	isManuallyUpdated,
	onToggle,
	onSubtaskStatusUpdate,
	onTodoToggle
}: KanbanSubtaskProps) {
	const styles = statusStyles[status];

	// todosの完了状態をチェックして、サブチケットのstatusを自動更新（一回だけ）
	// ただし、手動更新後は自動更新を無効化
	useEffect(() => {
		if (isManuallyUpdated || !onSubtaskStatusUpdate || !subtask.todos || subtask.todos.length === 0) return;

		const completedCount = subtask.todos.filter((todo: SubTodo) => todo.done).length;
		const totalCount = subtask.todos.length;
		
		let newStatus: 'todo' | 'active' | 'completed';
		
		if (completedCount === 0) {
			newStatus = 'todo';
		} else if (completedCount === totalCount) {
			newStatus = 'completed';
		} else {
			newStatus = 'active';
		}
		
		// 現在のstatusと異なる場合のみ更新（一回だけ）
		if (newStatus !== status) {
			onSubtaskStatusUpdate(subtask.id.toString(), newStatus);
		}
	}, [subtask.todos, isManuallyUpdated, status, subtask.id, onSubtaskStatusUpdate]);

	return (
		<div
			className={`${styles.bgColor} rounded p-2 text-xs text-neutral-700 border ${styles.borderColor} cursor-move`}
			draggable
			onDragStart={(e) => {
				const payload = { kind: 'subtask', id: subtask.id, title: subtask.title };
				e.dataTransfer.setData('application/json', JSON.stringify(payload));
				e.dataTransfer.effectAllowed = 'move';
			}}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="truncate">{subtask.title}</span>
				<div className="flex items-center gap-2">
					<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white">
						{Math.floor(Math.random() * 8) + 1}h
					</span>
					<button
						type="button"
						onClick={onToggle}
						className="h-4 w-4 inline-flex items-center justify-center rounded text-neutral-600 hover:bg-neutral-100 shrink-0"
					>
						<IconChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
					</button>
				</div>
			</div>
			
			{/* 実際のtodosデータを表示 */}
			{expanded && (
				<div className="mt-2 pl-3 space-y-1">
					{Array.isArray(subtask.todos) && subtask.todos.length > 0 ? (
						subtask.todos.map((todo: SubTodo) => (
							<TodoItem 
								key={todo.id} 
								todo={todo} 
								subtaskId={subtask.id}
								onTodoToggle={onTodoToggle}
							/>
						))
					) : (
						<div className="text-[10px] text-neutral-400">
							タスクがありません
						</div>
					)}
				</div>
			)}
		</div>
	);
} 