"use client";

import SubHeader from '../../molecules/SubHeader';
import TicketKanban from '../TicketKanban';
import ToggleButton from '../../atoms/ToggleButton';
import type { ParentTask } from '../../../types';

interface TicketContentProps {
	rightView: 'kanban' | 'timeline';
	onViewChange: (view: 'kanban' | 'timeline') => void;
	kanbanTickets: ParentTask[];
	isLeftPanelCollapsed: boolean;
	onToggleLeftPanel: () => void;
	onTicketActivate?: (ticketId: string, isActive: boolean) => void;
	onSubtaskStatusUpdate?: (subtaskId: string, status: 'todo' | 'active' | 'completed') => void;
	onTodoToggle?: (subtaskId: string, todoId: string, done: boolean) => void;
}

export default function TicketContent({ rightView, onViewChange, kanbanTickets, isLeftPanelCollapsed, onToggleLeftPanel, onTicketActivate, onSubtaskStatusUpdate, onTodoToggle }: TicketContentProps) {
	return (
		<div className="w-full h-full flex flex-col">
			<div className="px-3 py-3 flex-shrink-0 pt-5">
				<div className="flex items-center gap-4">
					{/* 左パネルトグルボタン */}
					<ToggleButton
						isCollapsed={isLeftPanelCollapsed}
						onToggle={onToggleLeftPanel}
						title={isLeftPanelCollapsed ? "左パネルを展開" : "左パネルを収納"}
					/>
					
					{/* メニューバー */}
					<SubHeader 
						items={[
							{ key: 'kanban', label: 'Active tickets' }, 
							{ key: 'timeline', label: 'Timeline' }
						]} 
						activeKey={rightView} 
						onChange={(k) => onViewChange(k as 'kanban' | 'timeline')} 
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto pl-3 pr-3 pb-16">
				{rightView === 'kanban' ? (
					<TicketKanban 
						tickets={kanbanTickets} 
						onTicketActivate={onTicketActivate} 
						onSubtaskStatusUpdate={onSubtaskStatusUpdate}
						onTodoToggle={onTodoToggle}
					/>
				) : (
					<section>
						<div className="text-[13px] text-neutral-600">Timeline coming soon...</div>
					</section>
				)}
			</div>
		</div>
	);
}
 