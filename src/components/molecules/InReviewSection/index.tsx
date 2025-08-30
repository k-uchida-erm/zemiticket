import SectionTitle from '../../atoms/SectionTitle';
import IconList from '../../atoms/icons/List';
import SubmittedTicketCard from '../SubmittedTicketCard';
import { ParentTask, SubTask } from '../../../types';

interface InReviewSectionProps {
	submittingTickets: Array<ParentTask & { children?: SubTask[] }>;
}

export default function InReviewSection({ submittingTickets }: InReviewSectionProps) {
	return (
		<section className="h-full">
			<SectionTitle icon={<IconList />}>In Review Tickets</SectionTitle>
			<div className="space-y-3">
				{submittingTickets.map((t, idx) => (
					<SubmittedTicketCard key={t.id ?? `review-${idx}`} ticket={t} />
				))}
			</div>
		</section>
	);
} 