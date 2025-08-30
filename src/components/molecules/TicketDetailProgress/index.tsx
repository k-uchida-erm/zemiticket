import ProgressBar from '../../atoms/ProgressBar';

interface TicketDetailProgressProps {
	percentage: number;
}

export default function TicketDetailProgress({ percentage }: TicketDetailProgressProps) {
	return (
		<div className="mt-4">
			<div className="text-[11px] text-neutral-600 mb-1">Progress</div>
			<ProgressBar percentage={percentage} />
			<div className="mt-1 text-[12px] text-neutral-700">{percentage}%</div>
		</div>
	);
} 