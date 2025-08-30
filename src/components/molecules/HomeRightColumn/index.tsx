import InReviewSection from '../InReviewSection';
import { ParentTask, SubTask } from '../../../types';

interface HomeRightColumnProps {
	submittingTickets: Array<ParentTask & { children?: SubTask[] }>;
}

export default function HomeRightColumn({ submittingTickets }: HomeRightColumnProps) {
	return (
		<div className="lg:col-span-2">
			<InReviewSection submittingTickets={submittingTickets} />
		</div>
	);
} 