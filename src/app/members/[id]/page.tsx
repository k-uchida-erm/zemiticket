'use client';

import React, { use, useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import PageHeader from '../../../components/atoms/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import { SidebarData } from '../../../types';

interface MemberPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function MemberPage({ params }: MemberPageProps): React.ReactElement {
	const resolvedParams = use(params);
	const [_sidebarData, setSidebarData] = useState<SidebarData | null>(null);
	const [member, setMember] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isAuthenticated, currentWorkspace } = useAuth();

	useEffect(() => {
		const fetchMemberData = async () => {
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

				// 学年別グループから該当するメンバーを検索
				let foundMember = null;
				if (data.members) {
					for (const gradeGroup of data.members) {
						const member = gradeGroup.members?.find((m: { id: string }) => m.id === resolvedParams.id);
						if (member) {
							foundMember = member;
							break;
						}
					}
				}

				if (!foundMember) {
					throw new Error('Member not found');
				}
				setMember(foundMember);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unknown error occurred');
				console.error('Failed to fetch member data:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMemberData();
	}, [isAuthenticated, user, currentWorkspace, resolvedParams.id]);

	if (!isAuthenticated || !user || !currentWorkspace) {
		return <></>;
	}

	if (isLoading || !member) {
		return <LoadingSpinner message="メンバー詳細を読み込み中..." fullScreen />;
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
						<PageHeader title={member?.name || 'メンバー'} />

						{/* メンバー情報 */}
						<div className="bg-neutral-50 rounded-lg p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="text-sm font-medium text-neutral-600 mb-1">名前</div>
									<div className="text-sm text-neutral-900">{member?.name}</div>
								</div>
								<div>
									<div className="text-sm font-medium text-neutral-600 mb-1">メールアドレス</div>
									<div className="text-sm text-neutral-900">{member?.email}</div>
								</div>
								<div>
									<div className="text-sm font-medium text-neutral-600 mb-1">役割</div>
									<div className="text-sm text-neutral-900">{member?.role}</div>
								</div>
								<div>
									<div className="text-sm font-medium text-neutral-600 mb-1">ステータス</div>
									<div className="text-sm text-green-600">アクティブ</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
