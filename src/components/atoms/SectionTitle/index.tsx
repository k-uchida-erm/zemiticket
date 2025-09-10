'use client';

import React from 'react';

interface SectionTitleProps {
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
	variant?: 'amber' | 'blue' | 'neutral' | string;
}

export default function SectionTitle({ children, className = '', icon, variant }: SectionTitleProps): React.ReactElement {
	void variant; // currently unused styling variant
	return (
		<div className={`px-3 pb-2 ${className}`}>
			<div className="flex items-center gap-2">
				{icon}
				<h1 className="text-sm font-semibold text-neutral-900">{children}</h1>
			</div>
		</div>
	);
}
