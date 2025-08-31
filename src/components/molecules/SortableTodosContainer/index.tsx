'use client';

import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SubTodo } from '../../../types';
import SortableTodo from '../../atoms/SortableTodo';
import TodoMemoEditor from '../TodoMemoEditor';
import TodoMemoViewer from '../TodoMemoViewer';


interface SortableTodosContainerProps {
	todos: SubTodo[];
	subtaskId: string;
	isEditing: boolean;
	editingTodoTitles: Record<string, string>;
	editingTodoEstimates: Record<string, string>;
	onToggle: (subtaskId: string, todoId: string) => void;
	onTitleChange: (subtaskId: string, todoId: string, title: string) => void;
	onEstimateChange: (
		subtaskId: string,
		todoId: string,
		estimate: string
	) => void;
	onDelete: (subtaskId: string, todoId: string) => void;
	onReorderTodos: (subtaskId: string, newOrder: SubTodo[]) => void;
	// 新しい機能のためのprops
	onAddMemo?: (todoId: string) => void;
	onAddFile?: (todoId: string) => void;
	showAddOptions?: Record<string, boolean>;
	onToggleAddOptions?: (todoId: string) => void;
	// メモ・ファイル表示のためのprops
	todoMemos?: Record<string, { content: string; html: string; images: File[] }>;
	expandedMemos?: Record<string, boolean>;
	editingMemos?: Record<string, boolean>;
	onMemoContentChange?: (todoId: string, content: string) => void;
	onMemoHtmlChange?: (todoId: string, html: string) => void;
	onImagePaste?: (todoId: string, file: File) => void;
	onImageDelete?: (todoId: string, imageIndex: number) => void;
	onToggleMemoExpanded?: (todoId: string) => void;
	onToggleMemoEditing?: (todoId: string) => void;
	onSaveMemo?: (todoId: string) => void;
	onCancelMemoEdit?: (todoId: string) => void;
	onDeleteMemo?: (todoId: string) => void;
}

export default function SortableTodosContainer({
	subtaskId,
	todos,
	isEditing,
	editingTodoTitles,
	editingTodoEstimates,
	onToggle,
	onTitleChange,
	onEstimateChange,
	onDelete,
	onReorderTodos,
	onAddMemo,
	onAddFile,
	showAddOptions,
	onToggleAddOptions,
	// メモ・ファイル表示のためのprops
	todoMemos,
	expandedMemos,
	editingMemos,
	onMemoContentChange,
	onMemoHtmlChange,
	onImagePaste,
	onImageDelete,
	onToggleMemoExpanded,
	onToggleMemoEditing: _onToggleMemoEditing,
	onSaveMemo,
	onCancelMemoEdit,
	onDeleteMemo,
}: SortableTodosContainerProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		if (!isEditing) return;
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = todos.findIndex(todo => `todo-${todo.id}` === active.id);
			const newIndex = todos.findIndex(todo => `todo-${todo.id}` === over?.id);

			const newOrder = arrayMove(todos, oldIndex, newIndex);
			onReorderTodos(subtaskId, newOrder);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<SortableContext
				items={todos.map(todo => `todo-${todo.id}`)}
				strategy={verticalListSortingStrategy}
			>
				<div className='space-y-1'>
					{todos.map(todo => (
						<div key={todo.id}>
							{/* TODO + ボタン + メモ表示ボタン */}
							<div className='flex items-center'>
								<div className='flex-1'>
									<SortableTodo
										todo={todo}
										subtaskId={subtaskId}
										isEditing={isEditing}
										editingTitle={editingTodoTitles[todo.id] || todo.title}
										editingEstimate={
											editingTodoEstimates[todo.id] ||
											todo.estimateHours?.toString() ||
											''
										}
										onToggle={onToggle}
										onTitleChange={onTitleChange}
										onEstimateChange={onEstimateChange}
										onDelete={onDelete}
										onToggleAddOptions={onToggleAddOptions}
										showAddOptions={showAddOptions?.[todo.id]}
										onAddMemo={onAddMemo}
										onAddFile={onAddFile}
										todoMemos={todoMemos}
										expandedMemos={expandedMemos}
										onToggleMemoExpanded={onToggleMemoExpanded}
									/>
								</div>
							</div>

							{/* メモ表示 */}
							{todoMemos?.[todo.id] && (
								<div className='ml-4'>
									{expandedMemos?.[todo.id] ? (
										<div className='space-y-0'>
											{/* 日付と時間表示（入力欄とは別、上に配置） */}
											<div className='flex items-center justify-between px-2 py-0.5'>
												<div className='text-xs text-gray-500'>
													{new Date().toLocaleDateString('ja-JP', {
														year: 'numeric',
														month: '2-digit',
														day: '2-digit'
													})} {new Date().toLocaleTimeString('ja-JP', {
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
												{/* 編集中の削除ボタン（日付の右） */}
												{editingMemos?.[todo.id] && (
													<button
														onClick={() => {
															if (window.confirm('このメモを削除してもよろしいですか？')) {
																onDeleteMemo?.(todo.id);
															}
														}}
														className='text-red-500 text-xs hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50'
													>
														メモを削除
													</button>
												)}
											</div>

											{/* メモ入力エリア（編集中はグレー背景、保存後は白背景） */}
											{editingMemos?.[todo.id] ? (
												/* 編集中：エディター */
												<div className='bg-gray-100 rounded-md border border-gray-200 p-3 relative'>
													{editingMemos?.[todo.id] && (
														<button
															onClick={() => {
																if (window.confirm('このメモを削除してもよろしいですか？')) {
																	onDeleteMemo?.(todo.id);
																}
															}}
															className='absolute top-2 right-2 text-red-500 text-xs hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50'
														>
															メモを削除
														</button>
													)}

													<TodoMemoEditor
														todoId={todo.id}
														html={todoMemos[todo.id]?.html || ''}
														onContentChange={(id, content) => onMemoContentChange?.(id, content)}
														onHtmlChange={(id, html) => onMemoHtmlChange?.(id, html)}
														onImagePaste={onImagePaste}
													/>

													{/* 保存・キャンセルボタン（右下） */}
													<div className='flex justify-end items-center gap-2 pt-2'>
														<button
															onClick={() => onSaveMemo?.(todo.id)}
															className='text-blue-600 text-xs hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 bg-white shadow-sm'
														>
															保存
														</button>
														<button
															onClick={() => onCancelMemoEdit?.(todo.id)}
															className='text-gray-600 text-xs hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 bg-white shadow-sm'
														>
															キャンセル
														</button>
													</div>
												</div>
											) : (
												/* 保存後：ビュー表示 */
												<TodoMemoViewer
													todoId={todo.id}
													html={todoMemos[todo.id]?.html}
													content={todoMemos[todo.id]?.content}
													images={todoMemos[todo.id]?.images}
													onImageDelete={(id, index) => onImageDelete?.(id, index)}
												/>
											)}

											{/* 区切り線（2件目のメモとの境目） */}
											<div className='border-t border-gray-200 mt-3'></div>
										</div>
									) : null}
								</div>
							)}
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
