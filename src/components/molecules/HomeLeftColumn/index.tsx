import ActiveTicketsBoard from '../../organisms/ActiveTicketsBoard';
import OthersActiveSection from '../OthersActiveSection';
import { ParentTask, SubTask } from '../../../types';

interface HomeLeftColumnProps {
	activeGroups: { parent: ParentTask; children: SubTask[] }[];
	othersGrouped: { user: string; tickets: Array<ParentTask & { children?: SubTask[] }> }[];
}

export default function HomeLeftColumn({ activeGroups, othersGrouped }: HomeLeftColumnProps) {
	return (
		<div className="lg:col-span-3 space-y-8">
			<ActiveTicketsBoard groups={activeGroups} />
			<OthersActiveSection othersGrouped={othersGrouped} />
		</div>
	);
} 