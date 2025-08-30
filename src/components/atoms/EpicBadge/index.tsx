interface EpicBadgeProps {
	epic: string;
	count: number;
}

export default function EpicBadge({ epic, count }: EpicBadgeProps) {
	return (
		<span className="inline-flex items-center text-[11px] px-1.5 py-[1px] rounded-full border border-[#00b393] text-neutral-700 bg-white">
			{epic}
		</span>
	);
} 