'use client';

import React from 'react';
import CalendarSection from '../../molecules/CalendarSection';
import NotificationsSection from '../../molecules/NotificationsSection';

interface NotificationItem {
	id: string;
	message: string;
	time: string;
}

interface RightSidebarProps {
	notifications: NotificationItem[];
}

export default function RightSidebar({ notifications }: RightSidebarProps): React.ReactElement {
	return (
		<aside className="flex flex-col h-full pt-6 pl-2">
			<NotificationsSection notifications={notifications} />
			<div className="mt-4">
				<CalendarSection />
			</div>
		</aside>
	);
}
