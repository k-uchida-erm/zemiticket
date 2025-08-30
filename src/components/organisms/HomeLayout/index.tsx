import HomeLeftColumn from '../../molecules/HomeLeftColumn';
import HomeRightColumn from '../../molecules/HomeRightColumn';
import { ParentTask, SubTask } from '../../../types';

interface HomeLayoutProps {
	activeGroups: { parent: ParentTask; children: SubTask[] }[];
	submittingTickets: Array<ParentTask & { children?: SubTask[] }>;
	othersGrouped: { user: string; tickets: Array<ParentTask & { children?: SubTask[] }> }[];
}

export default function HomeLayout({ activeGroups, submittingTickets, othersGrouped }: HomeLayoutProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
			<HomeLeftColumn 
				activeGroups={activeGroups} 
				othersGrouped={othersGrouped} 
			/>
			<div className="lg:col-span-2">
				<HomeRightColumn submittingTickets={submittingTickets} />
			</div>
		</div>
	);
} 