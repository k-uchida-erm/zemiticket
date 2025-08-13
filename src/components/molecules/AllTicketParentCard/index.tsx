"use client";

import { useState, useCallback } from 'react';
import ParentTicketCard from '../ParentTicketCard';
import type { ParentTask, SubTask } from '../../../types';

interface AllTicketParentCardProps {
	parent: ParentTask;
	subtasks?: SubTask[];
	onSelect?: (parent: ParentTask) => void;
}

export default function AllTicketParentCard({ parent, subtasks = [], onSelect }: AllTicketParentCardProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const onToggle = useCallback(() => setExpanded((v) => !v), []);

	return (
		<div role="button" onClick={() => onSelect?.(parent)} className="cursor-pointer">
			{/* eslint-disable-next-line react/no-children-prop */}
			<ParentTicketCard
				parent={parent}
				children={subtasks}
				size="xs"
				renderSubticketsInside
				hideProgress
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