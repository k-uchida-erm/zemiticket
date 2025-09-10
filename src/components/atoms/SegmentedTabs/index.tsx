'use client';

import React from 'react';

export type SegmentedOptionValue = 'all' | 'todo' | 'in_progress' | 'review' | 'done' | 'MY' | 'ALL';

interface SegmentedOption {
	value: SegmentedOptionValue;
	label: string;
}

interface SegmentedTabsProps {
	options: SegmentedOption[];
	selected: SegmentedOptionValue;
	onChange: (value: SegmentedOptionValue) => void;
	className?: string;
	variant?: 'plain' | 'filled';
	size?: 'sm' | 'compact' | 'md';
}

export default function SegmentedTabs({
	options,
	selected,
	onChange,
	className = '',
	variant = 'plain',
	size = 'md'
}: SegmentedTabsProps): React.ReactElement {
	const sizeClasses =
		size === 'sm'
			? 'h-5 text-[10px] min-w-[56px]'
			: size === 'compact'
				? 'h-5 text-[11px] min-w-[64px]'
				: 'h-6 text-[12px] min-w-[72px]';
	return (
		<div className={`inline-flex items-stretch gap-1 ${className}`} role="tablist">
			{options.map((opt: SegmentedOption, _idx: number) => {
				const isSelected: boolean = selected === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						role="tab"
						aria-selected={isSelected}
						onClick={() => onChange(opt.value)}
						className={`${sizeClasses} px-3 leading-none focus:outline-none transition-colors basis-0 grow whitespace-nowrap justify-center inline-flex items-center rounded-md ${
							variant === 'filled'
								? (isSelected ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900')
								: (isSelected ? 'bg-white text-neutral-900' : 'text-neutral-600 hover:text-neutral-900')
						}`}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}


