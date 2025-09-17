'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { HomeApiResponse } from '../types';

export default function DashboardPage(): React.ReactElement {
	const { user, isAuthenticated, currentWorkspace } = useAuth();
	const [homeData, setHomeData] = useState<HomeApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchHomeData = async () => {
			if (!isAuthenticated || !user || !currentWorkspace) {
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				const response = await fetch(`/api/home?scope=all&userId=${user.id}&workspaceId=${currentWorkspace.id}`);
				if (response.ok) {
					const data = await response.json();
					setHomeData(data);
				}
			} catch (error) {
				console.error('Failed to fetch home data:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchHomeData();
	}, [isAuthenticated, user, currentWorkspace]);

	if (!isAuthenticated || !user || !currentWorkspace) {
		return <></>;
	}

	if (isLoading) {
		return <LoadingSpinner message="ダッシュボードを読み込み中..." fullScreen />;
	}

	// 統計データの計算
	const _totalTickets = homeData ?
		(homeData.activeGroups?.reduce((acc, group) => acc + group.tickets.length, 0) || 0) +
		(homeData.submittingTickets?.length || 0) +
		(homeData.othersGrouped?.reduce((acc, group) => acc + (group.tickets?.length || 0), 0) || 0) : 0;

	const _inProgressTickets = homeData ?
		(homeData.activeGroups?.reduce((acc, group) =>
			acc + group.tickets.filter(ticket => ticket.status === 'in_progress').length, 0) || 0) +
		(homeData.submittingTickets?.filter(ticket => ticket.status === 'in_progress').length || 0) +
		(homeData.othersGrouped?.reduce((acc, group) =>
			acc + (group.tickets?.filter(ticket => ticket.status === 'in_progress').length || 0), 0) || 0) : 0;

	const _completedTickets = homeData ?
		(homeData.activeGroups?.reduce((acc, group) =>
			acc + group.tickets.filter(ticket => ticket.status === 'done').length, 0) || 0) +
		(homeData.submittingTickets?.filter(ticket => ticket.status === 'done').length || 0) +
		(homeData.othersGrouped?.reduce((acc, group) =>
			acc + (group.tickets?.filter(ticket => ticket.status === 'done').length || 0), 0) || 0) : 0;

	const _researchTopicsCount = homeData?.researchTopics?.length || 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center">
			<div className="text-center max-w-2xl mx-auto px-6">
				{/* Coming Soon Icon */}
				<div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
					<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>

				{/* Coming Soon Title */}
				<h1 className="text-4xl font-bold text-neutral-900 mb-4">
					Coming Soon
				</h1>

				{/* Description */}
				<p className="text-xl text-neutral-600 mb-8 leading-relaxed">
					ダッシュボード機能を準備中です。<br />
					グラフやカレンダーを含む包括的なダッシュボードを近日公開予定です。
				</p>

				{/* Current User Info */}
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-neutral-200/50 mb-8">
					<div className="flex items-center justify-center gap-3 mb-4">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-sm font-medium text-neutral-600">オンライン</span>
					</div>
					<h2 className="text-2xl font-semibold text-neutral-900 mb-2">
						{user.name}さん
					</h2>
					<p className="text-lg text-neutral-500">
						{currentWorkspace.name}
					</p>
				</div>

				{/* Quick Access Links */}
				<div className="space-y-4">
					<p className="text-sm text-neutral-500 mb-4">現在利用可能な機能</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/research-topics"
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							研究テーマ一覧
						</Link>
						<Link
							href="/members"
							className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							メンバー一覧
						</Link>
					</div>
				</div>

				{/* Progress Indicator */}
				<div className="mt-12">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
						<div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
						<div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
					</div>
					<p className="text-sm text-neutral-500">開発進行中...</p>
				</div>
			</div>
		</div>
	);
}
