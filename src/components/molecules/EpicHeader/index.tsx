"use client";

import EpicBadge from '../../atoms/EpicBadge';
import AddButton from '../../atoms/AddButton';

interface EpicHeaderProps {
	epic: string;
	count: number;
	onCreateEpic: (epic: string) => void;
}

export default function EpicHeader({ epic, count, onCreateEpic }: EpicHeaderProps) {
	return (
		<div className="absolute -left-[20px] -top-2 z-10 flex items-center gap-1.5">
			<EpicBadge epic={epic} count={count} />
			<AddButton onClick={() => onCreateEpic(epic)} />
		</div>
	);
} 