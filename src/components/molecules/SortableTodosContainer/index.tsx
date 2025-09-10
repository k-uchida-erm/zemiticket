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
import TodoMemoSection from '../TodoMemoSection';

interface MemoRowItem {
	id: string;
	todo_id: string;
	content_text: string;
	content_html: string;
	created_at?: string;
	updated_at?: string;
}

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
	memoLists?: Record<string, MemoRowItem[]>;
	onServerDeleteMemo?: (memoId: string, todoId: string) => void;
	onBeginEditExistingMemo?: (todoId: string, memo: MemoRowItem) => void;
	editingMemoTarget?: Record<string, string | null>;
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
	onDeleteMemo: _onDeleteMemo,
	memoLists,
	onServerDeleteMemo,
	onBeginEditExistingMemo,
	editingMemoTarget,
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
										memoCount={(memoLists?.[todo.id]?.length ?? 0)}
									/>
								</div>
							</div>

							{/* メモ表示セクション - TodoMemoSectionコンポーネントを使用 */}
							<TodoMemoSection
								todoId={todo.id}
								isExpanded={expandedMemos?.[todo.id] ?? false}
								isEditing={editingMemos?.[todo.id] ?? false}
								editingMemoTarget={editingMemoTarget?.[todo.id]}
								todoMemos={todoMemos?.[todo.id]}
								memoList={memoLists?.[todo.id] ?? []}
								onMemoContentChange={onMemoContentChange}
								onMemoHtmlChange={onMemoHtmlChange}
								onImagePaste={onImagePaste}
								onImageDelete={onImageDelete}
								onSaveMemo={onSaveMemo}
								onCancelMemoEdit={onCancelMemoEdit}
								onServerDeleteMemo={onServerDeleteMemo}
								onBeginEditExistingMemo={onBeginEditExistingMemo}
							/>
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
