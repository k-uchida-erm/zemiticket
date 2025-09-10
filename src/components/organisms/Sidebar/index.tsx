'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Workspace {
	id: string;
	name: string;
	description: string;
}

interface ResearchTopic {
	id: string;
	name: string;
	display_name: string;
	color: string;
}

interface User {
	id: string;
	name: string;
	email: string;
}

interface Member {
	id: string;
	name: string;
	email: string;
	role: string;
	grade: string;
}

interface MembersByGrade {
	grade: string;
	members: Member[];
}

interface SidebarData {
	workspaces: Workspace[];
	researchTopics: ResearchTopic[];
	members: MembersByGrade[];
	currentUser: User | null;
	owner: User | null;
}

export default function Sidebar({
	onToggle,
}: {
	onToggle: (_collapsed: boolean) => void;
}) {
	const pathname = usePathname();
	const [isCollapsed, _setIsCollapsed] = useState(false);
	const [showText, setShowText] = useState(false);
	const [sidebarData, setSidebarData] = useState<SidebarData>({
		workspaces: [],
		researchTopics: [],
		members: [],
		currentUser: null,
		owner: null
	});
	const [isLoading, setIsLoading] = useState(true);
	const [expandedSections, setExpandedSections] = useState({
		researchTopics: true,
		members: true
	});

	// サイドバーの状態が変更された時に親コンポーネントに通知
	useEffect(() => {
		onToggle(isCollapsed);
	}, [isCollapsed, onToggle]);

	// サイドバーの開閉アニメーション完了後に文字を表示
	useEffect(() => {
		if (isCollapsed) {
			setShowText(false);
		} else {
			const timer = setTimeout(() => {
				setShowText(true);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isCollapsed]);

	// サイドバーデータを取得
	useEffect(() => {
		const fetchSidebarData = async () => {
			try {
				const response = await fetch('/api/sidebar');
				if (response.ok) {
					const data = await response.json();
					setSidebarData(data);
				}
			} catch (error) {
				console.error('Failed to fetch sidebar data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSidebarData();
	}, []);

	const toggleSection = (section: 'researchTopics' | 'members') => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	return (
		<aside
			className={`fixed top-0 bottom-0 left-0 z-30 bg-neutral-50 border-r border-neutral-200 flex flex-col overscroll-contain transition-all duration-300 ${
				isCollapsed ? 'w-16' : 'w-[15vw]'
			}`}
			aria-label='サイドバー'
		>
			{/* Workspace header */}
			<div className='flex items-center px-3 py-2'>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 rounded-full bg-neutral-300/80' aria-hidden />
					{showText && !isCollapsed && !isLoading && (
						<div className='flex flex-col leading-tight'>
							<span className='text-[11px] font-medium text-neutral-900'>
								{sidebarData.workspaces[0]?.name || 'K_lab'}
							</span>
							{sidebarData.owner && (
								<span className='text-[10px] text-neutral-500'>
									{sidebarData.owner.name}
								</span>
							)}
						</div>
					)}
				</div>
			</div>



			<nav className='flex-1 py-1 overflow-auto overscroll-contain'>
			{/* User account info */}
				{showText && !isCollapsed && !isLoading && sidebarData.currentUser && (
					<div className='px-3 py-2'>
						<div className='text-[8px] text-neutral-400 font-medium mb-1'>Account</div>
						<div className='flex items-center gap-2'>
							<div className='h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center'>
								<span className='text-[10px] text-white font-medium'>
									{sidebarData.currentUser.name.charAt(0).toUpperCase()}
								</span>
							</div>
							<div className='flex flex-col leading-tight'>
								<span className='text-[10px] font-medium text-neutral-900'>
									{sidebarData.currentUser.name}
								</span>
								<span className='text-[9px] text-neutral-500 truncate max-w-[120px]'>
									{sidebarData.currentUser.email}
								</span>
							</div>
						</div>
					</div>
				)}
			{/* Top: home (plain text link to home) */}
			<div className='px-3 mt-6 mb-6'>
				<div className='text-[8px] text-neutral-400 font-medium mb-1'>Pages</div>
				<ul>
					<li className='mt-0'>
							<Link
								href='/'
								className={`flex items-center gap-2 rounded px-2 py-1.5 text-[11px] ${pathname === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-800 hover:bg-neutral-50'}`}
							>
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="flex-shrink-0"
							>
								<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
								<polyline points="9,22 9,12 15,12 15,22"/>
							</svg>
							home
						</Link>
					</li>
				</ul>
			</div>

				{/* Research Topics - Toggleable */}
				<div className='px-3 pt-1'>
					<div className='text-[8px] text-neutral-400 font-medium mb-1'>Zemi Information</div>
					<button
						onClick={() => toggleSection('researchTopics')}
						className='flex items-center w-full px-2 pt-1.5 rounded hover:bg-neutral-50 text-[11px] tracking-wide text-neutral-700 mb-1'
					>
						{showText && !isCollapsed && (
							<>
								<span>Research Topics</span>
								<svg
									className={`w-3 h-3 ml-1 transition-transform text-neutral-500 ${expandedSections.researchTopics ? 'rotate-0' : '-rotate-90'}`}
									viewBox="0 0 6 6"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M1 2l2 2 2-2"/>
								</svg>
							</>
						)}
					</button>
					{expandedSections.researchTopics && (
						<div className='ml-4'>
							{isLoading ? (
								<div className='px-2 py-1 text-[11px] text-neutral-500'>読み込み中...</div>
							) : (
								sidebarData.researchTopics.map((topic) => (
									<div key={topic.id} className='mb-1'>
										<div className='flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 text-[11px] text-neutral-800 cursor-pointer'>
											<div
												className='h-2 w-2 rounded-full'
												style={{ backgroundColor: topic.color }}
											></div>
											{showText && !isCollapsed && (
												<span className='truncate'>{topic.display_name}</span>
											)}
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>

				{/* Members - Toggleable */}
				<div className='px-3'>
					<button
						onClick={() => toggleSection('members')}
						className='flex items-center w-full px-2 py-1.5 rounded hover:bg-neutral-50 text-[11px] tracking-wide text-neutral-700 mb-1'
					>
						{showText && !isCollapsed && (
							<>
								<span>Members</span>
								<svg
									className={`w-3 h-3 ml-1 transition-transform text-neutral-500 ${expandedSections.members ? 'rotate-0' : '-rotate-90'}`}
									viewBox="0 0 6 6"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M1 2l2 2 2-2"/>
								</svg>
							</>
						)}
					</button>
					{expandedSections.members && (
						<div className='ml-4'>
							{isLoading ? (
								<div className='px-2 py-1 text-[11px] text-neutral-500'>読み込み中...</div>
							) : (
								sidebarData.members.map((gradeGroup) => (
									<div key={gradeGroup.grade} className='mb-2'>
										{/* 学年ヘッダー */}
										<div className='px-2 py-1 text-[10px] font-medium text-neutral-600 uppercase tracking-wide'>
											{gradeGroup.grade}
										</div>
										{/* その学年のメンバー */}
										{gradeGroup.members.map((member) => (
											<div key={member.id} className='mb-1 ml-2'>
												<div className='flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 text-[11px] text-neutral-800 cursor-pointer'>
													<div className='h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center'>
														<span className='text-[10px] text-white font-medium'>
															{member.name.charAt(0).toUpperCase()}
														</span>
													</div>
													{showText && !isCollapsed && (
														<div className='flex flex-col'>
															<span className='truncate'>{member.name}</span>
															{member.role === 'owner' && (
																<span className='text-[9px] text-neutral-500'>owner</span>
															)}
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								))
							)}
						</div>
					)}
				</div>

				<div className='mt-2 border-t border-neutral-100 pt-2'></div>
			</nav>
		</aside>
	);
}
