'use client';

import Link from 'next/link';
import React from 'react';

export interface Crumb {
	label: string;
	href?: string;
	id?: string;
}

interface BreadcrumbsProps {
	items: Crumb[];
	className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps): React.ReactElement {
	return (
		<nav aria-label="Breadcrumb" className={`text-[12px] text-neutral-500 ${className}`}>
			{items.map((item, idx) => (
				<span key={item.id || `${item.label}-${idx}`}>
					{idx > 0 && ' / '}
					{item.href ? (
						<Link href={item.href} className="hover:underline">
							{item.label}
						</Link>
					) : (
						<span>{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}


