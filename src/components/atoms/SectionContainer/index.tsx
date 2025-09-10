'use client';

import React from 'react';

interface SectionContainerProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	titleAction?: React.ReactNode;
}

export default function SectionContainer({
	children,
	className = '',
	title,
	titleAction
}: SectionContainerProps): React.ReactElement {
	return (
		<section className={`${className}`}>
			{title && (
				<div className="px-3 pb-2 flex items-center justify-between">
					<h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
					{titleAction}
				</div>
			)}
			<div className="p-2.5">
				{children}
			</div>
		</section>
	);
}
