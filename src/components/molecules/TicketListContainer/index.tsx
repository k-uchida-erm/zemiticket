import VerticalLine from '../../atoms/VerticalLine';
import EpicGroup from '../EpicGroup';

interface TicketGroup {
	epic: string;
	list: Array<{
		parent: any;
		children: any[];
	}>;
}

interface TicketListContainerProps {
	groupedByEpic: TicketGroup[];
	onSelect: (ticket: any) => void;
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
 
 
 
 
 
 