"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TicketCreateForm from '../../molecules/TicketCreateForm';
import TicketDetailPanel from '../TicketDetailPanel';
import type { ParentTask } from '../../../types';

interface TicketDetailOverlayProps {
	selected: ParentTask | null;
	creatingEpic: string | null;
	onClose: () => void;
	ticketsData: Array<{ list: Array<{ parent: ParentTask; children: ParentTask[] }> }>;
}

export default function TicketDetailOverlay({ 
	selected, 
	creatingEpic, 
	onClose, 
	ticketsData 
}: TicketDetailOverlayProps) {
	const router = useRouter();
	const [isFullscreen, setIsFullscreen] = useState(false);

	const handleToggleFullscreen = () => {
		if (selected && !isFullscreen) {
			// 全画面表示時に/ticket/[slug]のURLに遷移
			router.push(`/ticket/${selected.slug}`);
		}
		setIsFullscreen(!isFullscreen);
	};

	return (
		<div className={`absolute inset-0 h-full w-full bg-white transition-transform duration-300 translate-x-full ${(selected || creatingEpic) ? '!translate-x-0' : ''} z-50 overflow-hidden ${(selected || creatingEpic) ? 'border-l border-neutral-200' : ''}`}>
			<div 
				className="h-full px-6.5 pt-0 pb-8 overflow-y-auto"
				onScroll={(e) => {
					e.stopPropagation();
				}}
				style={{ 
					overscrollBehavior: 'contain',
					scrollbarWidth: 'thin',
					msOverflowStyle: 'none',
					maxHeight: '100vh',
					boxSizing: 'border-box',
					paddingBottom: '2rem'
				}}
			>
				{creatingEpic ? (
					<TicketCreateForm defaultEpic={creatingEpic} onCancel={onClose} onCreate={() => onClose()} />
				) : selected ? (
					(() => {
						const group = ticketsData.flatMap(g => g.list).find((g) => g.parent.id === selected.id);
						return (
							<TicketDetailPanel 
								parent={selected} 
								subtasks={group?.children || []} 
								onClose={onClose} 
								onSave={() => onClose()} 
								onToggleFullscreen={handleToggleFullscreen}
								isFullscreen={isFullscreen}
							/>
						);
					})()
				) : null}
			</div>
		</div>
	);
} 
 
 
 
 
 
 
 