'use client';

import React from 'react';
import PageHeader from '../../atoms/PageHeader';

interface ResearchTopicHeaderProps {
	name: string;
	color?: string;
}

export default function ResearchTopicHeader({ name, color = '#6b7280' }: ResearchTopicHeaderProps): React.ReactElement {
	return (
		<PageHeader
			title={name}
			icon={
				<div
					className="h-4 w-4 rounded-full"
					style={{ backgroundColor: color }}
				></div>
			}
		/>
	);
}


