'use client';

import React from 'react';
import SegmentedTabs, { SegmentedOptionValue } from '../../atoms/SegmentedTabs';

interface ResearchTopicsTemplateProps {
	header: React.ReactNode;
	segmented?: {
		options: Array<{ value: SegmentedOptionValue; label: string }>;
		selected: SegmentedOptionValue;
		onChange: (val: SegmentedOptionValue) => void;
		size?: 'default' | 'compact';
	};
	children: React.ReactNode;
}

export default function ResearchTopicsTemplate({ header, segmented, children }: ResearchTopicsTemplateProps): React.ReactElement {
	return (
		<div className="h-screen w-full bg-white text-neutral-900">
			<div className="h-full">
				<div className="h-full">
					<div className="min-h-full pt-4 pl-2 pr-4">
						{header}

						{segmented && (
							<div className="flex justify-start mb-4 px-2 max-w-2xl">
								<SegmentedTabs
									options={segmented.options}
									selected={segmented.selected}
									onChange={segmented.onChange}
									size={segmented.size || 'compact'}
								/>
							</div>
						)}

						{children}
					</div>
				</div>
			</div>
		</div>
	);
}


