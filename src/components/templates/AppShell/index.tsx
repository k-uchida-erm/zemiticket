'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../organisms/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const pathname = usePathname();

	// Redirect implicit OAuth token hashes to /auth/login for processing
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			window.location.hash &&
			window.location.hash.includes('access_token')
		) {
			const hash = window.location.hash;
			if (!pathname.startsWith('/auth/login')) {
				window.location.replace(`/auth/login${hash}`);
			}
		}
	}, [pathname]);

	const isAuthRoute =
		pathname === '/auth/login' || pathname.startsWith('/auth/');

	// チケットページは独立したスクロール、その他は全ページスクロール
	const isTicketPage =
		pathname === '/ticket' ||
		pathname.startsWith('/ticket/') ||
		pathname === '/ticket-map';

	// サイドバーの状態を管理する関数
	const handleSidebarToggle = (collapsed: boolean) => {
		setIsSidebarCollapsed(collapsed);
	};

	if (isAuthRoute) {
		return (
			<div className='min-h-screen bg-neutral-100'>
				<main className='min-h-screen'>{children}</main>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-white overflow-hidden'>
			{/* <Header /> hidden by request */}
			<Sidebar onToggle={handleSidebarToggle} />
			<div
				className='fixed top-0 right-0 bottom-0 transition-all duration-300'
				style={{
					left: isSidebarCollapsed ? 'calc(4rem + 8px)' : 'calc(15vw + 8px)',
				}}
			>
				<main
					className={`h-full ${isTicketPage ? 'overflow-hidden' : 'overflow-auto'}`}
					style={{
						paddingLeft: pathname === '/research' ? '20%' : '0%',
						paddingRight: pathname === '/research' ? '20%' : '0%',
						paddingTop: 0,
						paddingBottom: 0,
					}}
				>
					{pathname === '/ticket-map' ? (
						<div className='overflow-auto h-full'>{children}</div>
					) : (
						children
					)}
				</main>
			</div>
		</div>
	);
}
