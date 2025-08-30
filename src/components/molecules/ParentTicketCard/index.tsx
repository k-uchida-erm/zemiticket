"use client";

import { useState, useEffect } from 'react';
import { ParentTask, SubTask } from '../../../types';
import ProgressBar from '../../atoms/ProgressBar';
import Card from '../../atoms/Card';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import Link from 'next/link';
import SubTicketCard from '../SubTicketCard';
import IconTicket from '../../atoms/icons/Ticket';
import IconMoodGreat from '../../atoms/icons/MoodGreat';
import IconMoodNormal from '../../atoms/icons/MoodNormal';
import IconMoodRush from '../../atoms/icons/MoodRush';
import IconCircleCheck from '../../atoms/icons/CircleCheck';
import IconPlus from '../../atoms/icons/Plus';
import { useRouter } from 'next/navigation';

interface ParentTicketCardProps {
	parent: ParentTask;
	subtasks?: SubTask[];
	// legacy support (will be removed):
	children?: SubTask[];
	expanded?: boolean;
	onToggle?: () => void;
	onToggleTodo?: (subtaskId: number, todoId: number) => void;
	size?: 'md' | 'sm' | 'xs';
	renderSubticketsInside?: boolean;
	mood?: 'great' | 'normal' | 'rush';
	childrenReadOnly?: boolean;
	hideProgress?: boolean;
	hideDue?: boolean;
	inlineBadge?: React.ReactNode;
	hideEpic?: boolean;
	hideIcon?: boolean;
	disableLinks?: boolean;
	customSubtasksContent?: React.ReactNode;
}

function calcProgress(list: SubTask[]): number {
	if (list.length === 0) return 0;
	
	// todoの完了状態に基づいて進捗を計算
	let totalTodos = 0;
	let completedTodos = 0;
	
	list.forEach(subtask => {
		if (subtask.todos && Array.isArray(subtask.todos)) {
			subtask.todos.forEach(todo => {
				totalTodos++;
				if (todo.done) {
					completedTodos++;
				}
			});
		}
	});
	
	if (totalTodos === 0) return 0;
	return Math.round((completedTodos / totalTodos) * 100);
}

function isAllSubtasksCompleted(list: SubTask[]): boolean {
	if (list.length === 0) return false;
	
	// 各サブチケットのtodosが全て完了しているかチェック
	return list.every(subtask => {
		if (!subtask.todos || subtask.todos.length === 0) return false;
		return subtask.todos.every(todo => todo.done);
	});
}

function formatDue(due?: string): string {
	if (!due) return '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
		return `${due.replace(/-/g, '.')}`;
	}
	return `${due}`;
}

export default function ParentTicketCard({ parent, subtasks, children, expanded = true, onToggle, onToggleTodo, size = 'md', renderSubticketsInside = false, mood = 'normal', childrenReadOnly = false, hideProgress = false, hideDue = false, inlineBadge, hideEpic = false, hideIcon = false, disableLinks = false, customSubtasksContent }: ParentTicketCardProps) {
	const subtasksList: SubTask[] = Array.isArray(subtasks) ? subtasks : (children || []);
	const [currentProgress, setCurrentProgress] = useState(parent.progressPercentage ?? 0);
	const computedProgress = currentProgress;
	
	const router = useRouter();

	// 進捗更新イベントを監視
	useEffect(() => {
		const handleProgressUpdate = async (event: CustomEvent) => {
			// この親タスクに関連するtodoの更新かチェック
			if (event.detail.todoId) {
				const isRelatedTodo = subtasksList.some(subtask => 
					subtask.todos?.some(todo => todo.id === event.detail.todoId)
				);
				
				if (isRelatedTodo) {
					// DBから最新の進捗を取得
					try {
						const response = await fetch(`/api/parent-tasks/${parent.id}/progress`);
						if (response.ok) {
							const data = await response.json();
							const newProgress = data.progressPercentage;
							setCurrentProgress(newProgress);
						}
					} catch (error) {
						console.error('Failed to fetch latest progress:', error);
					}
				}
			}
		};

		window.addEventListener('todoProgressUpdated', handleProgressUpdate as unknown as EventListener);
		
		return () => {
			window.removeEventListener('todoProgressUpdated', handleProgressUpdate as unknown as EventListener);
		};
	}, [parent.id, subtasksList]);

	// 進捗の変更を監視
	useEffect(() => {
	}, [currentProgress]);





	const handleToggleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggle?.();
	};



	const handleReviewRequest = () => {
		if (parent.slug) {
			router.push(`/ticket/${parent.slug}/review-request`);
		}
	};

	const isSm = size === 'sm';
	const isXs = size === 'xs';
	const cardPadding = isXs ? 'p-1.5' : isSm ? 'p-3' : 'p-4';
	const minHeight = isXs ? 'min-h-[56px]' : isSm ? 'min-h-[80px]' : 'min-h-[96px]';
	const titleText = isXs ? 'text-[12px]' : isSm ? 'text-[13px]' : 'text-[14px]';
	const descText = isXs ? 'text-[10px]' : isSm ? 'text-[11px]' : 'text-[12px]';
	const progressMt = isXs ? 'mt-1.5' : isSm ? 'mt-2' : 'mt-3';
	const metaText = isXs ? 'text-[9px]' : isSm ? 'text-[10px]' : 'text-[11px]';
	const titleLeading = isXs ? 'leading-4' : 'leading-5';
	const titleRowMt = isXs ? 'mt-0' : 'mt-1';
	const titleRowGap = isXs ? 'gap-2' : 'gap-3';
	const descMt = isXs ? 'mt-0.5' : 'mt-1';
	const showToggle = !!onToggle || subtasksList.length > 0;

	const willWrapWholeCard = !renderSubticketsInside && !!parent.slug && !disableLinks;

	const titleNode = willWrapWholeCard
		? (<>{parent.title}</>)
		: (parent.slug && !disableLinks ? (
			<Link href={`/ticket/${parent.slug}`} aria-label={`${parent.title} details`} className="focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
				{parent.title}
			</Link>
		) : (
			<>{parent.title}</>
		));

	const contentTopPad = isXs ? 'pt-0' : isSm ? 'pt-0' : 'pt-0';

	const body = (
		<Card className={`${cardPadding} ${minHeight} relative shadow-sm rounded-md`}>
			{parent.due && !hideDue && (
				<div className={`absolute top-0 right-10 z-10 flex items-center gap-1`}>
					<div className="rounded-t-none rounded-b-lg bg-white font-medium text-[14px] pl-2.5 pr-3 py-1.5 tracking-[0.02em] leading-none tabular-nums border-x border-b border-neutral-200/70 text-center">
						<span className="text-neutral-700 font-['Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif]">due {formatDue(parent.due)}</span>
					</div>
					<span className={`inline-flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 ${mood === 'great' ? 'text-red-500' : mood === 'rush' ? 'text-blue-500' : 'text-amber-500'}`}>
						{mood === 'great' ? <IconMoodGreat /> : mood === 'rush' ? <IconMoodRush /> : <IconMoodNormal />}
					</span>
				</div>
			)}
			<div className={`flex items-start justify-between gap-4 ${contentTopPad}`}>
				<div className="flex-1 min-w-0">
					{!hideEpic && (
						<div className="-mt-2 mb-2">
							{parent.epic && (
								<span className="inline-flex items-center text-[11px] px-1.5 py-[1px] rounded-full border border-neutral-300 text-neutral-700 bg-white">
									{parent.epic}
								</span>
							)}
						</div>
					)}
					<div className={`flex items-start justify-between ${titleRowGap} ${titleRowMt}`}>
						<div className="min-w-0 flex items-center gap-2">
							{inlineBadge}
							{!hideIcon && (
								<span className="inline-flex items-center justify-center text-[#00b393] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-[1.8]">
									<IconTicket />
								</span>
							)}
							<h3 className={`${titleText} ${titleLeading} font-semibold tracking-tight text-neutral-800 truncate`}>{titleNode}</h3>
							{typeof parent.estimateHours === 'number' && (
								<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-indigo-700 text-white">{parent.estimateHours}h</span>
							)}
							{showToggle && (
								<button
									type="button"
									onClick={handleToggleClick}
									aria-expanded={expanded}
									aria-label={expanded ? 'Collapse subtickets' : 'Expand subtickets'}
									className="h-7 w-7 inline-flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50"
								>
									<IconChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
								</button>
							)}
						</div>
					</div>

					{parent.description && (
						<p className={`${descMt} ${descText} leading-5 text-neutral-600 line-clamp-2`}>
							{parent.description}
						</p>
					)}

					{!hideProgress && (
						<div className={progressMt}>
							<ProgressBar percentage={computedProgress} />
							<div className={`mt-1.5 flex items-center gap-3 ${metaText} text-neutral-600`}>
								<span>{computedProgress}%</span>
							</div>
						</div>
					)}

					{renderSubticketsInside && expanded && (
						<div className="mt-0">
							{customSubtasksContent ? (
								customSubtasksContent
							) : subtasksList.length > 0 ? (
								<>
									<ul className="space-y-0 divide-y divide-neutral-200 border-t border-neutral-200 mt-2">
										{subtasksList.map((child, index) => (
											<li key={child.id} className={`relative ${index === subtasksList.length - 1 ? 'pb-0' : ''}`}>
												<SubTicketCard ticket={child} variant="flat" readOnly={childrenReadOnly} disableLink={disableLinks} />
											</li>
										))}
									</ul>
									
									{/* Create a review request ボタン */}
									{isAllSubtasksCompleted(subtasksList) && (
										<div className="mt-0 pt-2 border-t border-neutral-200">
											<div className="flex justify-end">
												<button
													type="button"
													onClick={handleReviewRequest}
													className="px-4 py-2.5 bg-white border border-[#00b393] text-[#00b393] text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-[#00b393]/5"
												>
													<IconPlus className="w-4 h-4" />
													Create a review request
												</button>
											</div>
										</div>
									)}
								</>
							) : null}
						</div>
					)}
				</div>
			</div>
		</Card>
	);

	if (!willWrapWholeCard) return body;

	return (
		<Link href={`/ticket/${parent.slug}`} aria-label={`${parent.title} details`} className="block focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-none">
			{body}
		</Link>
	);
} 