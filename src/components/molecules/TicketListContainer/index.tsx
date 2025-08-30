import VerticalLine from '../../atoms/VerticalLine/index';
import EpicGroup from '../EpicGroup';
import type { ParentTask, SubTask } from '../../../types';

interface TicketGroup {
	epic: string;
	list: Array<{
		parent: ParentTask;
		children: SubTask[];
	}>;
}

interface TicketListContainerProps {
	groupedByEpic: TicketGroup[];
	onSelect: (ticket: ParentTask) => void;
	onCreateEpic: (epic: string) => void;
	selectedTicketSlug?: string;
}

export default function TicketListContainer({ groupedByEpic, onSelect, onCreateEpic, selectedTicketSlug }: TicketListContainerProps) {
	return (
		<div className="mt-5 space-y-3 relative pl-2">
			<VerticalLine />
			{groupedByEpic.map(({ epic, list }) => (
				<EpicGroup
					key={epic}
					epic={epic}
					list={list}
					onSelect={onSelect}
					onCreateEpic={onCreateEpic}
					selectedTicketSlug={selectedTicketSlug}
				/>
			))}
		</div>
	);
} 
 
 
 
 
 
 