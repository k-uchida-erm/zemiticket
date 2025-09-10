'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubTodo } from '../../../types';
import StatusDot from '../StatusDot';

interface SortableTodoProps {
	todo: SubTodo;
	subtaskId: string;
	isEditing: boolean;
	editingTitle: string;
	editingEstimate: string;
	onToggle: (subtaskId: string, todoId: string) => void;
	onTitleChange: (subtaskId: string, todoId: string, title: string) => void;
	onEstimateChange: (
		subtaskId: string,
		todoId: string,
		estimate: string
	) => void;
	onDelete: (subtaskId: string, todoId: string) => void;
	// +ボタン関連のprops
	onToggleAddOptions?: (todoId: string) => void;
	showAddOptions?: boolean;
	onAddMemo?: (todoId: string) => void;
	onAddFile?: (todoId: string) => void;
	// メモ表示関連のprops
	todoMemos?: Record<string, { content: string; images: File[] }>;
	expandedMemos?: Record<string, boolean>;
	onToggleMemoExpanded?: (todoId: string) => void;
	// 追加: メモ件数（一覧UI用）
	memoCount?: number;
}

export default function SortableTodo({
	todo,
	subtaskId,
	isEditing,
	editingTitle,
	editingEstimate,
	onToggle,
	onTitleChange,
	onEstimateChange,
	onDelete,
	onToggleAddOptions: _onToggleAddOptions,
	showAddOptions: _showAddOptions,
	onAddMemo,
	onAddFile: _onAddFile,
	todoMemos: _todoMemos,
	expandedMemos,
	onToggleMemoExpanded,
	memoCount,
}: SortableTodoProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: `todo-${todo.id}` });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-2 py-1 px-2 bg-white rounded ${isDragging ? 'shadow-lg' : ''}`}
		>
			{isEditing && (
				<div
					{...attributes}
					{...listeners}
					className='w-4 h-4 bg-neutral-200 rounded cursor-move flex items-center justify-center text-neutral-500 hover:bg-neutral-300 text-xs'
				>
					⋮⋮
				</div>
			)}

			{/* 完了状態チェックボックス */}
			<StatusDot
				completed={todo.done || false}
				_variant='todo'
				onClick={() => onToggle(subtaskId, todo.id)}
				className='cursor-pointer'
			/>

			{/* 編集モード */}
			{isEditing ? (
				<>
					<textarea
						value={editingTitle}
						onChange={e => onTitleChange(subtaskId, todo.id, e.target.value)}
						className='flex-1 px-2 py-1 border border-neutral-300 rounded text-[13px] resize-none min-h-[1.6rem] max-h-28'
						rows={1}
					/>
					<input
						type='number'
						step='0.5'
						value={editingEstimate}
						onChange={e => onEstimateChange(subtaskId, todo.id, e.target.value)}
						className='w-16 px-2 py-1 border border-neutral-300 rounded text-[13px]'
						placeholder='h'
					/>
					<button
						onClick={() => onDelete(subtaskId, todo.id)}
						className='px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600'
					>
						-
					</button>
				</>
			) : (
				<>
					<div className='flex items-center gap-2 flex-1 min-w-0'>
						<span className='text-[13px] text-neutral-700 whitespace-pre-wrap break-words'>
							{todo.title}
						</span>
						<span className='shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-amber-400 text-white'>
							{todo.estimateHours || 0}h
						</span>
						{/* +ボタン（時間チップの直後） */}
						<div className='relative'>
							<button
								type='button'
								onClick={() => onAddMemo?.(todo.id)}
								className='w-5 h-5 inline-flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300 ml-1'
							>
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
							</button>
						</div>

													{/* メモを表示ボタン（+ボタンの右） */}
							{(typeof memoCount === 'number' && memoCount > 0) && (
								<button
								onClick={() => onToggleMemoExpanded?.(todo.id)}
								className='text-blue-600 text-xs hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 ml-1 flex items-center gap-1'
							>
								<span>
									{expandedMemos?.[todo.id]
										? (typeof memoCount === 'number' ? `メモを閉じる（${memoCount}件）` : 'メモを閉じる')
										: (typeof memoCount === 'number' && memoCount > 0 ? `${memoCount}件のメモ` : 'メモを表示')}
								</span>
								<svg
									className={`w-3 h-3 transition-transform ${expandedMemos?.[todo.id] ? 'rotate-180' : ''}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
