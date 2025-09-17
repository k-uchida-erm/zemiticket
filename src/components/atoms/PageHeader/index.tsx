import React from 'react';

interface PageHeaderProps {
	title: string;
	icon?: React.ReactNode;
	className?: string;
}

export default function PageHeader({
	title,
	icon,
	className = ''
}: PageHeaderProps): React.ReactElement {
	return (
		<div className={`py-1 mb-3 ml-4 ${className}`}>
			<div className="flex items-center gap-2">
				{icon && (
					<div className="flex items-center justify-center">
						{icon}
					</div>
				)}
				<h1 className="text-sm font-medium text-neutral-900" style={{ fontWeight: 500 }}>
					{title}
				</h1>
			</div>
		</div>
	);
}
