'use client';

import React from 'react';

export type SegmentedOptionValue = string;

interface SegmentedOption {
	value: SegmentedOptionValue;
	label: string;
}

interface SegmentedTabsProps {
	options: SegmentedOption[];
	selected: SegmentedOptionValue;
	onChange: (value: SegmentedOptionValue) => void;
	size?: 'compact' | 'normal';
}

export default function SegmentedTabs({
	options,
	selected,
	onChange,
	size = 'normal'
}: SegmentedTabsProps): React.ReactElement {
	const baseClasses = size === 'compact' ? 'text-[10px] px-3 py-0.5' : 'text-[11px] px-4 py-0.5';

	return (
		<div className="inline-flex bg-neutral-100 rounded-md p-0.5 max-w-full">
			{options.map((option) => (
				<button
					key={option.value}
					onClick={() => onChange(option.value)}
					className={`
						${baseClasses}
						flex-1 rounded-sm font-medium transition-colors whitespace-nowrap text-center flex items-center justify-center
						${selected === option.value
							? 'bg-white text-neutral-900 shadow-sm'
							: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
						}
					`}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
