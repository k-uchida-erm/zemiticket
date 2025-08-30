"use client";

import { useMemo, useRef, useEffect, useState } from 'react';
import type { ParentTask, SubTask } from '../../../types';
import TicketDetailProgress from '../../molecules/TicketDetailProgress';
import AddSubticketRow from '../../molecules/AddSubticketRow';
import TicketDetailHeader from '../../molecules/TicketDetailHeader';
import SortableSubTasksContainer from '../../molecules/SortableSubTasksContainer';
import IconPlus from '../../atoms/icons/Plus';
import { useTicketDetailState } from '../../../lib/hooks/useTicketDetailState';
import { useTicketDetailAPI } from '../../../lib/hooks/useTicketDetailAPI';
import { useTicketDetailReorder } from '../../../lib/hooks/useTicketDetailReorder';
import { useTicketDetailEditing } from '../../../lib/hooks/useTicketDetailEditing';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface TicketDetailPanelProps {
	parent: ParentTask;
	subtasks?: SubTask[];
	onClose: () => void;
	onSave?: (data: { title: string; description: string; due: string }) => void;
	onToggleFullscreen?: () => void;
	isFullscreen?: boolean;
}

export default function TicketDetailPanel({ 
	parent, 
	subtasks = [], 
	onClose, 
	onSave, 
	onToggleFullscreen, 
	isFullscreen = false 
}: TicketDetailPanelProps) {
	// Use custom hooks
	const {
		editableTitle,
		setEditableTitle,
		editableDesc,
		setEditableDesc,
		editableDue,
		setEditableDue,
		dirty,
		setDirty,
		currentProgress,
		subs,
		setSubs,
		openTodos,
		setOpenTodos,
		addingSub,
		setAddingSub,
		newSubTitle,
		setNewSubTitle,
		newSubDue,
		setNewSubDue,
		addingTodo,
		setAddingTodo,
		newTodoTitle,
		setNewTodoTitle,
		newTodoEstimate,
		setNewTodoEstimate,
		editingSub,
		setEditingSub,
		editingSubTitle,
		setEditingSubTitle,
		editingTodoTitles,
		setEditingTodoTitles,
		editingTodoEstimates,
		setEditingTodoEstimates,
	} = useTicketDetailState(parent, subtasks);

	// コメント関連の状態
	const [subtaskComments, setSubtaskComments] = useState<Record<string, Comment[]>>({});
	const [todoComments, setTodoComments] = useState<Record<string, Comment[]>>({});

	// コメント関連のハンドラー
	const handleAddSubtaskComment = (subtaskId: string, text: string) => {
		const newComment: Comment = {
			id: `comment-${Date.now()}`,
			text,
			author: 'Current User', // TODO: 実際のユーザー情報を使用
			timestamp: new Date().toLocaleString()
		};

		setSubtaskComments(prev => ({
			...prev,
			[subtaskId]: [...(prev[subtaskId] || []), newComment]
		}));
	};

	const handleDeleteSubtaskComment = (subtaskId: string, commentId: string) => {
		setSubtaskComments(prev => ({
			...prev,
			[subtaskId]: (prev[subtaskId] || []).filter(c => c.id !== commentId)
		}));
	};

	// 親チケット用のダーティーフラグ（タイトル/説明/期日の変更にのみ反応）
	const [parentDirty, setParentDirty] = useState(false);

	const handleAddTodoComment = (subtaskId: string, todoId: string, text: string) => {
		const newComment: Comment = {
			id: `comment-${Date.now()}`,
			text,
			author: 'Current User', // TODO: 実際のユーザー情報を使用
			timestamp: new Date().toLocaleString()
		};

		setTodoComments(prev => ({
			...prev,
			[todoId]: [...(prev[todoId] || []), newComment]
		}));
	};

	const handleDeleteTodoComment = (subtaskId: string, todoId: string, commentId: string) => {
		setTodoComments(prev => ({
			...prev,
			[todoId]: (prev[todoId] || []).filter(c => c.id !== commentId)
		}));
	};

	const {
		handleHeaderSave,
		toggleTodo,
		saveEditingSub,
		deleteTodo,
		addTodo,
		createSub,
	} = useTicketDetailAPI();

	const {
		reorderSubtasks,
		reorderTodos,
	} = useTicketDetailReorder();

	const {
		startEditingSub,
		cancelEditingSub,
	} = useTicketDetailEditing();

	const titleRef = useRef<HTMLDivElement>(null);
	const descRef = useRef<HTMLDivElement>(null);

	// Initialize refs when parent changes
	useEffect(() => {
		if (titleRef.current) titleRef.current.innerText = parent.title || '';
		if (descRef.current) descRef.current.innerText = parent.description || '';
	}, [parent.id, parent.title, parent.description]);

	// 親タスクの合計時間を計算（サブタスク内のTODOの時間のみ）
	const calculateParentTaskTotalHours = useMemo(() => {
		let totalHours = 0;
		subs.forEach(sub => {
			if (sub.todos) {
				sub.todos.forEach(todo => {
					if (todo.estimateHours) {
						totalHours += todo.estimateHours;
					}
				});
			}
		});
		return totalHours;
	}, [subs]);

	// Header save/cancel handlers
	async function handleHeaderSaveWrapper() {
		const title = titleRef.current?.innerText ?? editableTitle;
		const desc = descRef.current?.innerText ?? editableDesc;
		await handleHeaderSave(parent, title, desc, editableDue, setDirty);
		setParentDirty(false);
	}

	function handleHeaderCancel() {
		if (titleRef.current) titleRef.current.innerText = parent.title || '';
		if (descRef.current) descRef.current.innerText = parent.description || '';
		setEditableTitle(parent.title || '');
		setEditableDesc(parent.description || '');
		setEditableDue(parent.due || '');
		setDirty(false);
		setParentDirty(false);
		setAddingSub(false);
		setNewSubTitle('');
		setNewSubDue('');
	}

	return (
		<div className="pt-5 pb-20 relative">
			<TicketDetailHeader
				isFullscreen={!!isFullscreen}
				onToggleFullscreen={onToggleFullscreen || (() => {})}
				onClose={onClose}
				dirty={parentDirty}
				onSave={handleHeaderSaveWrapper}
				onCancel={handleHeaderCancel}
				titleRef={titleRef}
				descRef={descRef}
				onInputTitle={(text) => { setEditableTitle(text); setParentDirty(true); setDirty(true); }}
				onInputDesc={(text) => { setEditableDesc(text); setParentDirty(true); setDirty(true); }}
				editableDue={editableDue}
				onChangeDue={(v) => { setEditableDue(v); setParentDirty(true); setDirty(true); }}
				epicLabel={parent.epic || '未分類'}
				totalHours={calculateParentTaskTotalHours}
			/>

			<TicketDetailProgress percentage={currentProgress} />

			{/* Subtickets ラベルと追加ボタン */}
			<div className="mt-4 flex items-center justify-between">
				<div className="text-[11px] text-neutral-600">Subtickets</div>
				{!addingSub && (
					<button
						type="button"
						onClick={() => setAddingSub(true)}
						className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#00b393] hover:bg-[#00b393]/10 border border-[#00b393] rounded"
					>
						<IconPlus className="w-3 h-3" />
						Add Subticket
					</button>
				)}
			</div>

			{/* サブチケット追加ボタンとサブチケットリストの間の余白 */}
			<div className="mt-2"></div>

			<SortableSubTasksContainer
				parent={parent}
				subtasks={subs}
				openTodos={openTodos}
				onToggleTodos={(subtaskId: string) => setOpenTodos((prev) => ({ ...prev, [subtaskId]: !prev[subtaskId] }))}
				onToggleTodo={(subtaskId: string, todoId: string) => { 
					const subIdx = subs.findIndex(s => s.id === subtaskId); 
					if (subIdx !== -1) { 
						toggleTodo(subs, subIdx, todoId, setSubs, setDirty); 
						
						// 進捗更新イベントを発火
						const updatedSubs = [...subs];
						const updatedSub = { ...updatedSubs[subIdx] };
						const todoIdx = updatedSub.todos?.findIndex(t => t.id === todoId);
						if (todoIdx !== undefined && todoIdx !== -1 && updatedSub.todos) {
							updatedSub.todos[todoIdx] = { ...updatedSub.todos[todoIdx], done: !updatedSub.todos[todoIdx].done };
							updatedSubs[subIdx] = updatedSub;
							
							// 進捗を計算
							const totalTodos = updatedSubs.reduce((total, sub) => total + (sub.todos?.length || 0), 0);
							const completedTodos = updatedSubs.reduce((total, sub) => total + (sub.todos?.filter(t => t.done).length || 0), 0);
							const progress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
							
							// カスタムイベントを発火
							window.dispatchEvent(new CustomEvent('todoProgressUpdated', {
								detail: {
									todoId,
									subtaskId,
									parentId: parent.id,
									progress
								}
							}));
						}
					} 
				}}
				onEditSub={(subtaskId: string) => { 
					startEditingSub(subs, subtaskId, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates); 
				}}
				onSaveSub={(subtaskId: string) => { 
					saveEditingSub(subs, subtaskId, editingSubTitle, editingTodoTitles, editingTodoEstimates, setSubs, setEditingSub, setDirty); 
				}}
				onCancelSub={(subtaskId: string) => { 
					cancelEditingSub(subs, subtaskId, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates); 
				}}
				onDeleteTodo={(subtaskId: string, todoId: string) => { 
					const subIdx = subs.findIndex(s => s.id === subtaskId); 
					if (subIdx !== -1) { 
						deleteTodo(subs, subIdx, todoId, setSubs, setDirty); 
					} 
				}}
				onReorderSubtasks={(newOrder) => reorderSubtasks(newOrder, subtasks, setSubs)}
				onReorderTodos={(subtaskId, newOrder) => reorderTodos(subtaskId, newOrder, subtasks, setSubs)}
				editingSub={editingSub}
				editingSubTitle={editingSubTitle}
				editingTodoTitles={editingTodoTitles}
				editingTodoEstimates={editingTodoEstimates}
				onSubTitleChange={(subtaskId: string, title: string) => { 
					setEditingSubTitle(prev => ({ ...prev, [subtaskId]: title })); 
				}}
				onTodoTitleChange={(subtaskId: string, todoId: string, title: string) => { 
					setEditingTodoTitles(prev => ({ 
						...prev, 
						[subtaskId]: { ...prev[subtaskId], [todoId]: title } 
					})); 
				}}
				onTodoEstimateChange={(subtaskId: string, todoId: string, estimate: string) => { 
					setEditingTodoEstimates(prev => ({ 
						...prev, 
						[subtaskId]: { ...prev[subtaskId], [todoId]: estimate } 
					})); 
				}}
				onAddTodo={(subtaskId: string) => { 
					const subIdx = subs.findIndex(s => s.id === subtaskId); 
					if (subIdx !== -1) { 
						setAddingTodo(prev => ({ ...prev, [subtaskId]: true })); 
					} 
				}}
				onSaveNewTodo={(subtaskId: string) => { 
					const subIdx = subs.findIndex(s => s.id === subtaskId); 
					if (subIdx !== -1) { 
						addTodo(subs, subIdx, newTodoTitle, newTodoEstimate, setSubs, setAddingTodo, setNewTodoTitle, setNewTodoEstimate, setDirty); 
					} 
				}}
				onCancelNewTodo={(subtaskId: string) => { 
					setAddingTodo(prev => ({ ...prev, [subtaskId]: false })); 
					setNewTodoTitle(prev => ({ ...prev, [subtaskId]: '' })); 
					setNewTodoEstimate(prev => ({ ...prev, [subtaskId]: '' })); 
				}}
				onNewTodoTitleChange={(subtaskId: string, title: string) => { 
					setNewTodoTitle(prev => ({ ...prev, [subtaskId]: title })); 
				}}
				onNewTodoEstimateChange={(subtaskId: string, estimate: string) => { 
					setNewTodoEstimate(prev => ({ ...prev, [subtaskId]: estimate })); 
				}}
				addingTodo={addingTodo}
				newTodoTitle={newTodoTitle}
				newTodoEstimate={newTodoEstimate}
				// コメント関連のprops（デフォルト値を設定）
				subtaskComments={subtaskComments || {}}
				onAddSubtaskComment={handleAddSubtaskComment}
				onDeleteSubtaskComment={handleDeleteSubtaskComment}
				todoComments={todoComments || {}}
				onAddTodoComment={handleAddTodoComment}
				onDeleteTodoComment={handleDeleteTodoComment}
			/>

			<AddSubticketRow
				adding={addingSub}
				title={newSubTitle}
				onTitleChange={setNewSubTitle}
				due={newSubDue}
				onDueChange={setNewSubDue}
				onSubmit={() => createSub(parent, newSubTitle, newSubDue, setSubs, setOpenTodos, setAddingSub, setNewSubTitle, setNewSubDue, setDirty)}
				onCancel={() => { 
					setAddingSub(false);
					setNewSubTitle('');
					setNewSubDue('');
				}}
			/>
		</div>
	);
} 
