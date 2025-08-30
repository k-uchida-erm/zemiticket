import SectionTitle from '../../atoms/SectionTitle';
import IconUser from '../../atoms/icons/User';
import OthersActiveRow from '../OthersActiveRow';
import { ParentTask, SubTask } from '../../../types';

interface OthersActiveSectionProps {
	othersGrouped: { user: string; tickets: Array<ParentTask & { children?: SubTask[] }> }[];
}

export default function OthersActiveSection({ othersGrouped }: OthersActiveSectionProps) {
	return (
		<section>
			<SectionTitle variant="amber" icon={<IconUser />}>Others Active Tickets</SectionTitle>
			<div className="space-y-3">
				{othersGrouped.map((g, idx) => (
					<OthersActiveRow key={idx} user={g.user} tickets={g.tickets} />
				))}
			</div>
		</section>
	);
} 