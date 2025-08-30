"use client";

import EpicHeader from '../EpicHeader';
import AllTicketParentCard from '../AllTicketParentCard';

interface EpicGroupProps {
	epic: string;
	list: Array<{
		parent: any;
		children: any[];
	}>;
	onSelect: (ticket: any) => void;
	onCreateEpic: (epic: string) => void;
	selectedTicketSlug?: string;
}

export default function EpicGroup({ epic, list, onSelect, onCreateEpic, selectedTicketSlug }: EpicGroupProps) {
	// リストの安全性チェック
	if (!list || list.length === 0) {
		return (
			<div className="relative pt-6 pb-3">
				<EpicHeader 
					epic={epic} 
					count={0} 
					onCreateEpic={onCreateEpic} 
				/>
				<div className="mt-1 text-center text-neutral-400 text-[12px]">
					No tickets in this epic
				</div>
			</div>
		);
	}

	return (
		<div className="relative pt-6 pb-3">
			<EpicHeader 
				epic={epic} 
				count={list.length} 
				onCreateEpic={onCreateEpic} 
			/>
			<div className="mt-1 space-y-1.5">
				{list
					.filter((g) => g && g.parent) // 無効なアイテムを先に除外
					.map((g, index) => (
						<AllTicketParentCard
							key={g.parent.id || `${epic}-ticket-${index}`}
							parent={g.parent}
							subtasks={g.children || []}
							onSelect={onSelect}
							isSelected={g.parent.slug === selectedTicketSlug}
						/>
					))}
			</div>
		</div>
	);
} 
 
 
 
 
 
 