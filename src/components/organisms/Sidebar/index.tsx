'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

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
	const {
		user,
		isAuthenticated,
		currentWorkspace,
		userWorkspaces,
		switchWorkspace
	} = useAuth();
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
	const [myResearchTopics, setMyResearchTopics] = useState<Array<{ id: string; name: string; color: string }>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedSections, setExpandedSections] = useState({
		researchTopics: false,
		members: false
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

	// サイドバーデータを取得（認証状態とワークスペースに基づく）
	useEffect(() => {
		if (!isAuthenticated || !user || !currentWorkspace) return;

		const fetchSidebarData = async () => {
			try {
				const response = await fetch(`/api/sidebar?workspaceId=${currentWorkspace.id}`);
				if (response.ok) {
					const data = await response.json();
					setSidebarData(data);
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to fetch sidebar data:', error);
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchSidebarData();
	}, [isAuthenticated, user, currentWorkspace]);

	// 自分がアサインされているチケットがある研究テーマを取得
	useEffect(() => {
		if (!isAuthenticated || !user || !currentWorkspace) return;

		const fetchMyResearchTopics = async () => {
			try {
				const response = await fetch(`/api/home?scope=my&userId=${user.id}&workspaceId=${currentWorkspace.id}`);
				if (response.ok) {
					const data = await response.json();

					// 自分がアサインされているチケットがある研究テーマのIDを収集
					const myResearchTopicIds = new Set<string>();

					// activeGroupsから
					if (data.activeGroups) {
						data.activeGroups.forEach((group: { researchTopicId?: string }) => {
							if (group.researchTopicId) {
								myResearchTopicIds.add(group.researchTopicId);
							}
						});
					}

					// submittingTicketsから
					if (data.submittingTickets) {
						data.submittingTickets.forEach((ticket: { research_topic_id?: string }) => {
							if (ticket.research_topic_id) {
								myResearchTopicIds.add(ticket.research_topic_id);
							}
						});
					}

					// othersGroupedから
					if (data.othersGrouped) {
						data.othersGrouped.forEach((group: { tickets?: { research_topic_id?: string }[] }) => {
							if (group.tickets) {
								group.tickets.forEach((ticket: { research_topic_id?: string }) => {
									if (ticket.research_topic_id) {
										myResearchTopicIds.add(ticket.research_topic_id);
									}
								});
							}
						});
					}

					// サイドバーデータから該当する研究テーマを取得
					if (sidebarData.researchTopics) {
						const myTopics = sidebarData.researchTopics.filter(topic =>
							myResearchTopicIds.has(topic.id)
						);
						setMyResearchTopics(myTopics);
					}
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to fetch my research topics:', error);
				}
			}
		};

		if (sidebarData.researchTopics.length > 0) {
			fetchMyResearchTopics();
		}
	}, [isAuthenticated, user, currentWorkspace, sidebarData.researchTopics]);

	const toggleSection = (section: 'researchTopics' | 'members') => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// 認証されていない場合やワークスペースが選択されていない場合は何も表示しない
	if (!isAuthenticated || !user || !currentWorkspace) {
		return null;
	}

	return (
		<aside
			className={`fixed top-0 bottom-0 left-0 z-30 bg-neutral-50 border-r border-neutral-200 flex flex-col overscroll-contain transition-all duration-300 ${
				isCollapsed ? 'w-16' : 'w-[15vw]'
			}`}
			aria-label='サイドバー'
		>
			{/* Workspace header */}
			<div className='flex items-center px-3 py-4'>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg' aria-hidden>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							<path d="M12 6v6l4 2"/>
						</svg>
					</div>
					{showText && !isCollapsed && !isLoading && (
						<div className='flex flex-col leading-tight'>
							<span className='text-[13px] font-semibold text-neutral-900'>
								{currentWorkspace?.name || 'K_lab'}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Workspace switcher */}
			{showText && !isCollapsed && !isLoading && userWorkspaces.length > 1 && (
				<div className='px-3 py-2'>
					<div className='text-[8px] text-neutral-400 font-medium mb-1'>Workspace</div>
					<select
						value={currentWorkspace?.id || ''}
						onChange={(e) => switchWorkspace(e.target.value)}
						className='w-full text-[10px] px-2 py-1 border border-neutral-300 rounded bg-white'
					>
									{userWorkspaces.map((uw) => (
										<option key={uw.workspace?.id} value={uw.workspace?.id}>
											{uw.workspace?.name} ({uw.role})
										</option>
									))}
					</select>
				</div>
			)}



			<nav className='flex-1 py-1 overflow-auto overscroll-contain'>
			{/* Top: home (plain text link to home) */}
			<div className='px-3 mt-2 mb-6'>
				<ul>
					<li className='mt-0'>
							<Link
								href='/'
								className={`flex items-center gap-2 rounded px-2 py-1.5 text-[11px] ${pathname === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-800 hover:bg-neutral-50'}`}
							>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="flex-shrink-0"
							>
								<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
								<polyline points="9,22 9,12 15,12 15,22"/>
							</svg>
							Home
						</Link>
					</li>
				</ul>
			</div>

			{/* My Research Topics */}
			{showText && !isCollapsed && !isLoading && myResearchTopics && myResearchTopics.length > 0 && (
				<div className='px-3 mb-6'>
					<div className='text-[8px] text-neutral-400 font-medium mb-1'>My Research Topics</div>
					<ul>
						{myResearchTopics.map((topic) => (
							<li key={topic.id} className='mt-0'>
								<Link
									href={`/research-topics/${topic.id}`}
									className={`flex items-center gap-2 rounded px-2 py-1.5 text-[11px] ${pathname === `/research-topics/${topic.id}` ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-800 hover:bg-neutral-50'}`}
								>
									<div
										className="h-3 w-3 rounded-full flex-shrink-0"
										style={{ backgroundColor: topic.color || '#6b7280' }}
									></div>
									{topic.name}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}

				{/* Research Topics - Toggleable */}
				<div className='px-3 pt-1'>
					<div className='text-[8px] text-neutral-400 font-medium mb-1'>Zemi Information</div>
					<div className="flex items-center">
						<Link
							href='/research-topics'
							className={`flex items-center flex-1 px-2 py-1.5 rounded text-[11px] tracking-wide ${pathname === '/research-topics' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'}`}
						>
							{showText && !isCollapsed && (
								<>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="flex-shrink-0 mr-2"
									>
										<line x1="8" y1="6" x2="21" y2="6"/>
										<line x1="8" y1="12" x2="21" y2="12"/>
										<line x1="8" y1="18" x2="21" y2="18"/>
										<line x1="3" y1="6" x2="3.01" y2="6"/>
										<line x1="3" y1="12" x2="3.01" y2="12"/>
										<line x1="3" y1="18" x2="3.01" y2="18"/>
									</svg>
									<span>Research Topics</span>
								</>
							)}
						</Link>
						{showText && !isCollapsed && (
							<button
								onClick={() => toggleSection('researchTopics')}
								className="px-2 py-1.5 text-neutral-500 hover:text-neutral-700"
							>
								<svg
									className={`w-3 h-3 transition-transform ${expandedSections.researchTopics ? 'rotate-0' : '-rotate-90'}`}
									viewBox="0 0 6 6"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M1 2l2 2 2-2"/>
								</svg>
							</button>
						)}
					</div>
					{expandedSections.researchTopics && (
						<div className='ml-4'>
							{sidebarData.researchTopics.map((topic) => (
									<div key={topic.id} className='mb-1'>
										<Link
											href={`/research-topics/${topic.id}`}
											className='flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 text-[11px] text-neutral-800'
										>
											<div
												className='h-2 w-2 rounded-full'
												style={{ backgroundColor: topic.color }}
											></div>
											{showText && !isCollapsed && (
												<span className='truncate'>{topic.display_name}</span>
											)}
										</Link>
									</div>
								))}
						</div>
					)}
				</div>

				{/* Members - Toggleable */}
				<div className='px-3'>
					<div className="flex items-center">
						<Link
							href='/members'
							className={`flex items-center flex-1 px-2 py-1.5 rounded text-[11px] tracking-wide ${pathname === '/members' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'}`}
						>
							{showText && !isCollapsed && (
								<>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="flex-shrink-0 mr-2"
									>
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
										<circle cx="12" cy="7" r="4"/>
									</svg>
									<span>Members</span>
								</>
							)}
						</Link>
						{showText && !isCollapsed && (
							<button
								onClick={() => toggleSection('members')}
								className="px-2 py-1.5 text-neutral-500 hover:text-neutral-700"
							>
								<svg
									className={`w-3 h-3 transition-transform ${expandedSections.members ? 'rotate-0' : '-rotate-90'}`}
									viewBox="0 0 6 6"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M1 2l2 2 2-2"/>
								</svg>
							</button>
						)}
					</div>
					{expandedSections.members && (
						<div className='ml-4'>
							{sidebarData.members.map((gradeGroup) => (
									<div key={gradeGroup.grade} className='mb-2'>
										{/* 学年ヘッダー */}
										<div className='px-2 py-1 text-[10px] font-medium text-neutral-600 uppercase tracking-wide'>
											{gradeGroup.grade}
										</div>
										{/* その学年のメンバー */}
										{gradeGroup.members.map((member) => (
											<div key={member.id} className='mb-1 ml-2'>
												<Link
													href={`/members/${member.id}`}
													className='flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 text-[11px] text-neutral-800'
												>
													<div className='h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center'>
														<span className='text-[10px] text-white font-medium'>
															{member.name?.charAt(0)?.toUpperCase() || '?'}
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
												</Link>
											</div>
										))}
									</div>
								))}
						</div>
					)}
				</div>

				<div className='mt-2'></div>
			</nav>

			{/* Fixed Account Info at Bottom */}
			{showText && !isCollapsed && !isLoading && user && (
				<div className='px-3 py-3 bg-neutral-50/50'>
					<div className='flex items-center gap-2'>
						<div className='h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center'>
							<span className='text-[11px] text-white font-medium'>
								{user.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className='flex flex-col leading-tight flex-1 min-w-0'>
							<span className='text-[11px] font-medium text-neutral-900 truncate'>
								{user.name}
							</span>
							<span className='text-[9px] text-neutral-500 truncate'>
								{user.email}
							</span>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}
