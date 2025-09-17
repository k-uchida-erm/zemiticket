'use client';

import React from 'react';

interface SectionCardProps {
	title?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}

export default function SectionCard({ title, actions, children, className = '' }: SectionCardProps): React.ReactElement {
	return (
		<section className={`rounded-lg border border-neutral-200 bg-white ${className}`}>
			{(title || actions) && (
				<header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
					{title ? <h3 className="text-[13px] font-medium text-neutral-700">{title}</h3> : <div />}
					{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
				</header>
			)}
			<div className="p-4">
				{children}
			</div>
		</section>
	);
}



