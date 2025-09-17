'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import PageHeader from '../../components/atoms/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarData } from '../../types';

export default function MembersPage(): React.ReactElement {
	const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isAuthenticated, currentWorkspace } = useAuth();

	useEffect(() => {
		const fetchMembersData = async () => {
			if (!isAuthenticated || !user || !currentWorkspace) {
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch(`/api/sidebar?workspaceId=${currentWorkspace.id}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setSidebarData(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unknown error occurred');
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to fetch members data:', err);
				}
			} finally {
				setIsLoading(false);
			}
		};
		fetchMembersData();
	}, [isAuthenticated, user, currentWorkspace]);

	if (!isAuthenticated || !user || !currentWorkspace) {
		return <></>;
	}

	if (isLoading) {
		return <LoadingSpinner message="メンバー情報を読み込み中..." fullScreen />;
	}

	if (error) {
		return (
			<div className="h-screen w-full bg-white text-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<div className="text-lg font-medium text-red-600">エラーが発生しました</div>
					<div className="text-sm text-neutral-500 mt-2">{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen w-full bg-white text-neutral-900">
			<div className="h-full">
				<div className="h-full">
					{/* Main Content */}
					<div className="min-h-full pt-4 pl-2 pr-4">
						<PageHeader title="Members" />

						{/* メンバー一覧 */}
						<div className="divide-y divide-neutral-100">
							{!sidebarData?.members || sidebarData.members.length === 0 ? (
								<div className="flex items-center justify-center py-10">
									<div className="text-neutral-500">メンバーがありません</div>
								</div>
							) : (
								<div className="space-y-6">
									{sidebarData.members.map((gradeGroup) => (
										<div key={gradeGroup.grade}>
											{/* 学年ヘッダー */}
											<div className="px-4 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wide border-b border-neutral-200">
												{gradeGroup.grade}
											</div>
											{/* その学年のメンバー */}
											<ul className="relative">
												{gradeGroup.members.map((member) => (
													<li key={member.id} className="px-4 py-3 hover:bg-neutral-50">
														<div className="flex items-center gap-3">
															<div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
																<span className="text-sm text-white font-medium">
																	{member.name?.charAt(0)?.toUpperCase() || '?'}
																</span>
															</div>
															<div className="flex-1">
																<div className="text-sm font-medium text-neutral-900">
																	{member.name}
																</div>
																<div className="text-xs text-neutral-500">
																	{member.email}
																</div>
															</div>
															<div className="text-xs text-neutral-400">
																{member.role}
															</div>
														</div>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
