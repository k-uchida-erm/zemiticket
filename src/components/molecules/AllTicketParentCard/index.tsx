"use client";

import { useState, useCallback } from 'react';
import ParentTicketCard from '../ParentTicketCard';
import type { ParentTask, SubTask } from '../../../types';

interface AllTicketParentCardProps {
	parent: ParentTask;
	subtasks?: SubTask[];
	onSelect?: (parent: ParentTask) => void;
	isSelected?: boolean;
}

export default function AllTicketParentCard({ parent, subtasks = [], onSelect, isSelected = false }: AllTicketParentCardProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const onToggle = useCallback(() => setExpanded((v) => !v), []);

	const onDragStart = useCallback((e: React.DragEvent) => {
		const payload = { kind: 'parent', id: parent.id, title: parent.title };
		e.dataTransfer.setData('application/json', JSON.stringify(payload));
		e.dataTransfer.effectAllowed = 'move';
	}, [parent.id, parent.title]);

	return (
		<div 
			role="button" 
			onClick={() => onSelect?.(parent)} 
			className={`cursor-pointer ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`} 
			draggable 
			onDragStart={onDragStart}
		>
			<ParentTicketCard
				parent={parent}
				subtasks={subtasks}
				size="xs"
				renderSubticketsInside
				hideEpic
				hideIcon
				hideDue
				disableLinks
				expanded={expanded}
				onToggle={onToggle}
			/>
		</div>
	);
} 