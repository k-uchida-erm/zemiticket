"use client";

import { ParentTask, SubTask } from '../../../types';
import ProgressBar from '../../atoms/ProgressBar';
import Card from '../../atoms/Card';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import Link from 'next/link';
import SubTicketCard from '../SubTicketCard';
import IconTicket from '../../atoms/icons/Ticket';
import IconMoodGreat from '../../atoms/icons/MoodGreat';
import IconMoodNormal from '../../atoms/icons/MoodNormal';
import IconMoodRush from '../../atoms/icons/MoodRush';
import IconCircleCheck from '../../atoms/icons/CircleCheck';

interface ParentTicketCardProps {
	parent: ParentTask;
	children?: SubTask[];
	expanded?: boolean;
	onToggle?: () => void;
	size?: 'md' | 'sm' | 'xs';
	renderSubticketsInside?: boolean;
	mood?: 'great' | 'normal' | 'rush';
	childrenReadOnly?: boolean;
	hideProgress?: boolean;
	hideDue?: boolean;
	inlineBadge?: React.ReactNode;
	hideEpic?: boolean;
	hideIcon?: boolean;
	disableLinks?: boolean;
}

function calcProgress(children: SubTask[]): number {
	if (children.length === 0) return 0;
	const completed = children.filter((c) => c.done).length;
	return Math.round((completed / children.length) * 100);
}

function formatDue(due?: string): string {
	if (!due) return '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
		return `${due.replace(/-/g, '.')}`;
	}
	return `${due}`;
}

export default function ParentTicketCard({ parent, children = [], expanded = true, onToggle, size = 'md', renderSubticketsInside = false, mood = 'normal', childrenReadOnly = false, hideProgress = false, hideDue = false, inlineBadge, hideEpic = false, hideIcon = false, disableLinks = false }: ParentTicketCardProps) {
	const computedProgress = parent.progressPercentage ?? calcProgress(children);

	const handleToggleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggle?.();
	};

	const isSm = size === 'sm';
	const isXs = size === 'xs';
	const cardPadding = isXs ? 'p-1.5' : isSm ? 'p-3' : 'p-4';
	const minHeight = isXs ? 'min-h-[56px]' : isSm ? 'min-h-[80px]' : 'min-h-[96px]';
	const titleText = isXs ? 'text-[12px]' : isSm ? 'text-[13px]' : 'text-[14px]';
	const descText = isXs ? 'text-[10px]' : isSm ? 'text-[11px]' : 'text-[12px]';
	const progressMt = isXs ? 'mt-1.5' : isSm ? 'mt-2' : 'mt-3';
	const metaText = isXs ? 'text-[9px]' : isSm ? 'text-[10px]' : 'text-[11px]';
	const titleLeading = isXs ? 'leading-4' : 'leading-5';
	const titleRowMt = isXs ? 'mt-0' : 'mt-1';
	const titleRowGap = isXs ? 'gap-2' : 'gap-3';
	const descMt = isXs ? 'mt-0.5' : 'mt-1';
	const showToggle = !!onToggle || children.length > 0;

	// Wrap entire card as a link only when we are NOT rendering subtickets inside and links are enabled
	const willWrapWholeCard = !renderSubticketsInside && !!parent.slug && !disableLinks;

	const titleNode = willWrapWholeCard
		? (<>{parent.title}</>)
		: (parent.slug && !disableLinks ? (
			<Link href={`/ticket/${parent.slug}`} aria-label={`${parent.title} details`} className="focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
				{parent.title}
			</Link>
		) : (
			<>{parent.title}</>
		));

	const contentTopPad = isXs ? 'pt-0' : isSm ? 'pt-0' : 'pt-0';

	const body = (
		<Card className={`${cardPadding} ${minHeight} relative`}>
			{/* Corner circle-check (xs only): center aligns with top-right corner */}
			{isXs && (
				<div className="absolute top-0 right-0 transform translate-x-[30%] -translate-y-[30%] pointer-events-none">
					<span className="inline-flex items-center justify-center text-[#00b393] [&_svg]:w-4 [&_svg]:h-4">
						<IconCircleCheck />
					</span>
				</div>
			)}
			{parent.due && !hideDue && (
				<div className={`absolute top-0 right-10 z-10 flex items-center gap-1`}>
					<div className="rounded-t-none rounded-b-lg bg-white font-medium text-[14px] pl-2.5 pr-3 py-1.5 tracking-[0.02em] leading-none tabular-nums border-x border-b border-neutral-200/70 text-center">
						<span className="text-neutral-700 font-[ui-rounded,'SF Pro Rounded','Hiragino Maru Gothic ProN','Noto Sans JP',sans-serif]">{formatDue(parent.due)}</span>
					</div>
					<span className={`inline-flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 ${mood === 'great' ? 'text-red-500' : mood === 'rush' ? 'text-blue-500' : 'text-amber-500'}`}>
						{mood === 'great' ? <IconMoodGreat /> : mood === 'rush' ? <IconMoodRush /> : <IconMoodNormal />}
					</span>
				</div>
			)}
			<div className={`flex items-start justify-between gap-4 ${contentTopPad}`}>
				<div className="flex-1 min-w-0">
					{/* Epic chip above the title tightened further */}
					{!hideEpic && (
						<div className="-mt-2 mb-2">
							{parent.epic && (
								<span className="inline-flex items-center text-[11px] px-1.5 py-[1px] rounded-full border border-neutral-300 text-neutral-700 bg-white">
									{parent.epic}
								</span>
							)}
						</div>
					)}
					<div className={`flex items-start justify-between ${titleRowGap} ${titleRowMt}`}>
						<div className="min-w-0 flex items-center gap-2">
							{!hideIcon && (
								<span className="inline-flex items-center justify-center text-[#00b393] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-[1.8]">
									<IconTicket />
								</span>
							)}
							<h3 className={`${titleText} ${titleLeading} font-normal tracking-tight text-neutral-900 truncate`}>{titleNode}</h3>
							{typeof parent.estimateHours === 'number' && (
								<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-indigo-700 text-white">{parent.estimateHours}h</span>
							)}
							{inlineBadge}
							{showToggle && (
								<button
									type="button"
									onClick={handleToggleClick}
									aria-expanded={expanded}
									aria-label={expanded ? 'Collapse subtickets' : 'Expand subtickets'}
									className="h-7 w-7 inline-flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50"
								>
									<IconChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
								</button>
							)}
						</div>
					</div>

					{parent.description && (
						<p className={`${descMt} ${descText} leading-5 text-neutral-600 line-clamp-2`}>
							{parent.description}
						</p>
					)}

					{!hideProgress && (
						<div className={progressMt}>
							<ProgressBar percentage={computedProgress} />
							<div className={`mt-1.5 flex items-center gap-3 ${metaText} text-neutral-600`}>
								<span>{computedProgress}%</span>
							</div>
						</div>
					)}

					{renderSubticketsInside && expanded && children.length > 0 && (
						<div className="mt-0">
							<ul className="space-y-0 divide-y divide-neutral-200 border-t border-neutral-200 mt-2">
								{children.map((child) => (
									<li key={child.id} className="relative">
										<SubTicketCard ticket={child} variant="flat" readOnly={childrenReadOnly} disableLink={disableLinks} />
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</Card>
	);

	// If rendering subtickets inside, do not wrap the entire card in a link
	if (!willWrapWholeCard) return body;

	return (
		<Link href={`/ticket/${parent.slug}`} aria-label={`${parent.title} details`} className="block focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
			{body}
		</Link>
	);
} 