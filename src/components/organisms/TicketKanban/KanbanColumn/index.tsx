"use client";

import KanbanSubtask from '../KanbanSubtask';
import type { SubTask } from '../../../../types';

interface KanbanColumnProps {
	status: 'todo' | 'active' | 'completed';
	subtasks: SubTask[];
	expandedSubtasks: Set<string | number>;
	manuallyUpdatedSubtasks: Set<string | number>;
	onToggleSubtask: (subtaskId: string | number) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onSubtaskStatusUpdate?: (subtaskId: string, status: 'todo' | 'active' | 'completed') => void;
	onTodoToggle?: (subtaskId: string, todoId: string, done: boolean) => void;
}

const statusConfig = {
	todo: {
		label: 'To Do',
		color: 'neutral',
		bgColor: 'bg-neutral-50',
		borderColor: 'border-neutral-200',
		dotColor: 'bg-neutral-400',
		countBgColor: 'bg-neutral-200',
		countTextColor: 'text-neutral-600'
	},
	active: {
		label: 'Active',
		color: 'orange',
		bgColor: 'bg-orange-50',
		borderColor: 'border-orange-200',
		dotColor: 'bg-orange-500',
		countBgColor: 'bg-orange-500/20',
		countTextColor: 'text-orange-600'
	},
	completed: {
		label: 'Completed',
		color: 'green',
		bgColor: 'bg-[#00b393]/10',
		borderColor: 'border-[#00b393]/20',
		dotColor: 'bg-[#00b393]',
		countBgColor: 'bg-[#00b393]/20',
		countTextColor: 'text-[#00b393]'
	}
};

export default function KanbanColumn({
	status,
	subtasks,
	expandedSubtasks,
	manuallyUpdatedSubtasks,
	onToggleSubtask,
	onDragOver,
	onDrop,
	onSubtaskStatusUpdate,
	onTodoToggle
}: KanbanColumnProps) {
	const config = statusConfig[status];
	const filteredSubtasks = subtasks.filter(s => s.status === status);

	return (
		<div
			className={`px-3 first:pl-0 last:pr-0`}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className="flex items-center gap-2 mb-2">
				<div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
				<h5 className="text-xs font-medium text-neutral-600">{config.label}</h5>
				<span className={`text-xs ${config.countBgColor} ${config.countTextColor} px-1.5 py-0.5 rounded-full`}>
					{filteredSubtasks.length}
				</span>
			</div>
			<div className="min-h-[100px] space-y-1">
				{filteredSubtasks.map((subtask) => (
					<KanbanSubtask
						key={subtask.id}
						subtask={subtask}
						status={status}
						expanded={expandedSubtasks.has(subtask.id)}
						isManuallyUpdated={manuallyUpdatedSubtasks.has(subtask.id)}
						onToggle={() => onToggleSubtask(subtask.id)}
						onSubtaskStatusUpdate={onSubtaskStatusUpdate}
						onTodoToggle={onTodoToggle}
					/>
				))}
			</div>
		</div>
	);
} 