"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ParentTask, SubTask, SubTodo } from '../../../types';
import StatusDot from '../../atoms/StatusDot';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import IconPlus from '../../atoms/icons/Plus';
import SortableTodosContainer from '../SortableTodosContainer';
import CommentSection from '../CommentSection';
import { useMemo } from 'react';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface SortableSubTaskProps {
	subtask: SubTask & { todos?: SubTodo[] };
	parent: ParentTask;
	openTodos: Record<string, boolean>;
	onToggleTodos: (subtaskId: string) => void;
	onToggleTodo: (subtaskId: string, todoId: string) => void;
	onEditSub: (subtaskId: string) => void;
	onSaveSub: (subtaskId: string) => void;
	onCancelSub: (subtaskId: string) => void;
	onDeleteTodo: (subtaskId: string, todoId: string) => void;
	onReorderTodos: (subtaskId: string, newOrder: SubTodo[]) => void;
	editingSub: Record<string, boolean>;
	editingSubTitle: Record<string, string>;
	editingTodoTitles: Record<string, Record<string, string>>;
	editingTodoEstimates: Record<string, Record<string, string>>;
	onSubTitleChange: (subtaskId: string, title: string) => void;
	onTodoTitleChange: (subtaskId: string, todoId: string, title: string) => void;
	onTodoEstimateChange: (subtaskId: string, todoId: string, estimate: string) => void;
	onAddTodo: (subtaskId: string) => void;
	onSaveNewTodo: (subtaskId: string) => void;
	onCancelNewTodo: (subtaskId: string) => void;
	addingTodo: Record<string, boolean>;
	newTodoTitle: Record<string, string>;
	newTodoEstimate: Record<string, string>;
	onNewTodoTitleChange: (subtaskId: string, title: string) => void;
	onNewTodoEstimateChange: (subtaskId: string, estimate: string) => void;
	// コメント関連のprops
	subtaskComments?: Record<string, Comment[]>;
	onAddSubtaskComment?: (subtaskId: string, text: string) => void;
	onDeleteSubtaskComment?: (subtaskId: string, commentId: string) => void;
	todoComments?: Record<string, Comment[]>;
	onAddTodoComment?: (subtaskId: string, todoId: string, text: string) => void;
	onDeleteTodoComment?: (subtaskId: string, todoId: string, commentId: string) => void;
}

export default function SortableSubTask({
	subtask,
	parent,
	openTodos,
	onToggleTodos,
	onToggleTodo,
	onEditSub,
	onSaveSub,
	onCancelSub,
	onDeleteTodo,
	onReorderTodos,
	editingSub,
	editingSubTitle,
	editingTodoTitles,
	editingTodoEstimates,
	onSubTitleChange,
	onTodoTitleChange,
	onTodoEstimateChange,
	onAddTodo,
	onSaveNewTodo,
	onCancelNewTodo,
	addingTodo,
	newTodoTitle,
	newTodoEstimate,
	onNewTodoTitleChange,
	onNewTodoEstimateChange,
	subtaskComments,
	onAddSubtaskComment,
	onDeleteSubtaskComment,
	todoComments,
	onAddTodoComment,
	onDeleteTodoComment
}: SortableSubTaskProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: subtask.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isOpen = openTodos[subtask.id] || false;
	const isEditing = editingSub[subtask.id];
	const isAddingTodo = addingTodo[subtask.id];
	const todos = subtask.todos || [];
	const allTodosDone = todos.length > 0 && todos.every(todo => todo.done);

	// サブタスクの合計時間を計算（サブタスク内のTODOの時間のみ）
	const calculateSubTaskTotalHours = useMemo(() => {
		let totalHours = 0;
		if (subtask.todos) {
			subtask.todos.forEach(todo => {
				if (todo.estimateHours) {
					totalHours += todo.estimateHours;
				}
			});
		}
		return totalHours;
	}, [subtask.todos]);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative p-3 border border-neutral-200 rounded-lg bg-white ${isDragging ? 'shadow-lg' : ''}`}
		>
			{/* ドラッグハンドル - トグルが閉じている時のみ表示 */}
			{!isOpen && (
				<div
					{...attributes}
					{...listeners}
					className="absolute top-1/2 -translate-y-1/2 left-2 w-6 h-6 bg-neutral-100 rounded cursor-move flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
				>
					⋮⋮
				</div>
			)}

			{/* サブタスクヘッダー - トグルが開いている時は左寄せ */}
			<div className={`flex items-start justify-between ${isOpen ? 'ml-0' : 'ml-8'}`}>
				<div className="flex items-start gap-2 flex-1 min-w-0">
					{/* 完了時のみチェックマークを表示 */}
					{allTodosDone && (
						<div className="shrink-0">
							<StatusDot completed={true} variant="subticket" disabled={true} className="cursor-default" />
						</div>
					)}
					
					{/* タイトル */}
					<div className="min-w-0 flex-1">
						{isEditing ? (
							<textarea
								value={editingSubTitle[subtask.id] || subtask.title}
								onChange={(e) => onSubTitleChange(subtask.id, e.target.value)}
								className="w-full px-2 py-1 border border-neutral-300 rounded text-sm resize-none min-h-[2rem] max-h-32"
								autoFocus
								rows={1}
							/>
						) : (
							<h3 className="text-sm font-medium text-neutral-900 leading-6 whitespace-pre-wrap break-words">
								{subtask.title}
							</h3>
						)}
					</div>

					{/* 時間チップとトグルボタンを左寄せ */}
					<div className="flex items-center gap-2 shrink-0">
						{/* 時間チップ - 0時間も表示 */}
						<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white">
							{calculateSubTaskTotalHours}h
						</span>

						{/* 完了状態トグル */}
						<button
							type="button"
							onClick={() => onToggleTodos(subtask.id)}
							className="shrink-0 p-1 text-neutral-500 hover:text-neutral-700"
						>
							<IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
						</button>
					</div>
				</div>

				{/* アクションボタン */}
				<div className="flex items-center gap-2 ml-4">
					{isEditing ? (
						<>
							<button
								onClick={() => onCancelSub(subtask.id)}
								className="px-3 py-1 bg-white border border-neutral-300 text-neutral-700 text-xs rounded hover:bg-neutral-50"
							>
								キャンセル
							</button>
							<button
								onClick={() => {
									onSaveSub(subtask.id);
								}}
								className="px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]"
							>
								保存
							</button>
						</>
					) : (
						<button
							onClick={() => {
								onEditSub(subtask.id);
							}}
							className="px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]"
						>
							編集
						</button>
					)}
				</div>
			</div>

			{/* TODOリスト */}
			{isOpen && (
				<div className="mt-2 ml-8 space-y-1">
					{/* 並び替え可能なTODOリスト */}
					{todos.length > 0 && (
						<SortableTodosContainer
							todos={todos}
							subtaskId={subtask.id}
							isEditing={isEditing}
							editingTodoTitles={editingTodoTitles[subtask.id] || {}}
							editingTodoEstimates={editingTodoEstimates[subtask.id] || {}}
							onToggle={onToggleTodo}
							onTitleChange={onTodoTitleChange}
							onEstimateChange={onTodoEstimateChange}
							onDelete={onDeleteTodo}
							onReorderTodos={onReorderTodos}
							// コメント関連のprops
							todoComments={todoComments}
							onAddTodoComment={onAddTodoComment}
							onDeleteTodoComment={onDeleteTodoComment}
						/>
					)}

					{/* 新しいTODO追加 */}
					{isEditing && isAddingTodo ? (
						<div className="flex items-center gap-2 p-2 bg-white rounded">
							{/* 入力フィールド */}
							<input
								type="text"
								value={newTodoTitle[subtask.id] || ''}
								onChange={(e) => onNewTodoTitleChange(subtask.id, e.target.value)}
								placeholder="新しいTODO"
								className="flex-1 px-2 py-1 border border-neutral-300 rounded text-xs"
								autoFocus
							/>
							<input
								type="number"
								step="0.5"
								value={newTodoEstimate[subtask.id] || ''}
								onChange={(e) => onNewTodoEstimateChange(subtask.id, e.target.value)}
								placeholder="時間"
								className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs"
							/>
							
							{/* ボタン */}
							<button
								onClick={() => onCancelNewTodo(subtask.id)}
								className="px-3 py-1 bg-white border border-neutral-300 text-neutral-700 text-xs rounded hover:bg-neutral-50"
							>
								キャンセル
							</button>
							<button
								onClick={() => onSaveNewTodo(subtask.id)}
								className="px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]"
							>
								追加
							</button>
						</div>
					) : isEditing ? (
						<button
							onClick={() => onAddTodo(subtask.id)}
							className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
						>
							<IconPlus className="w-3 h-3" />
							<span>新しいTODOを追加</span>
						</button>
					) : null}
				</div>
			)}

			{/* コメントセクション */}
			{isOpen && (
				<div className="mt-3 ml-8">
					<CommentSection
						comments={subtaskComments?.[subtask.id] || []}
						onAddComment={(text: string) => onAddSubtaskComment?.(subtask.id, text)}
						onDeleteComment={(commentId: string) => onDeleteSubtaskComment?.(subtask.id, commentId)}
						title="コメント"
						compact={true}
					/>
				</div>
			)}
		</div>
	);
} 
 