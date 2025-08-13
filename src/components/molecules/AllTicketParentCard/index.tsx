"use client";

import { useState, useCallback } from 'react';
import ParentTicketCard from '../ParentTicketCard';
import type { ParentTask, SubTask } from '../../../types';

interface AllTicketParentCardProps {
	parent: ParentTask;
	children?: SubTask[];
	onSelect?: (parent: ParentTask) => void;
}

export default function AllTicketParentCard({ parent, children = [], onSelect }: AllTicketParentCardProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const onToggle = useCallback(() => setExpanded((v) => !v), []);

	return (
		<div role="button" onClick={() => onSelect?.(parent)} className="cursor-pointer">
			<ParentTicketCard
				parent={parent}
				children={children}
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