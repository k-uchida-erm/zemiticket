'use client';

import React from 'react';
import SectionContainer from '../../atoms/SectionContainer';

interface NotificationItem {
	id: string;
	message: string;
	time: string;
}

interface NotificationsSectionProps {
	notifications: NotificationItem[];
}

export default function NotificationsSection({ notifications }: NotificationsSectionProps): React.ReactElement {
	return (
		<SectionContainer
			title="notifications"
			titleAction={<div className="h-1.5 w-1.5 bg-neutral-400 rounded-full"></div>}
		>
			<div className="space-y-1.5">
				{notifications.map((notification) => (
					<div key={notification.id} className="p-2 rounded border border-neutral-100 hover:bg-neutral-50 transition-colors">
						<div className="flex items-center justify-between">
							<span className="text-[11px] text-neutral-700 truncate">{notification.message}</span>
							<span className="text-[10px] text-neutral-500 ml-2">{notification.time}</span>
						</div>
					</div>
				))}
			</div>
		</SectionContainer>
	);
}
