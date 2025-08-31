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
import SortableSubTask from '../SortableSubTask';

import { useMemo } from 'react';
import { ParentTask, SubTask, SubTodo } from '../../../types';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface SortableSubTasksContainerProps {
	subtasks: (SubTask & { todos?: SubTodo[] })[];
	parent: ParentTask;
	openTodos: Record<string, boolean>;
	onToggleTodos: (subtaskId: string) => void;
	onToggleTodo: (subtaskId: string, todoId: string) => void;
	onEditSub: (subtaskId: string) => void;
	onSaveSub: (subtaskId: string) => void;
	onCancelSub: (subtaskId: string) => void;
	onDeleteTodo: (subtaskId: string, todoId: string) => void;
	onReorderSubtasks: (newOrder: (SubTask & { todos?: SubTodo[] })[]) => void;
	onReorderTodos: (subtaskId: string, newOrder: SubTodo[]) => void;
	editingSub: Record<string, boolean>;
	editingSubTitle: Record<string, string>;
	editingTodoTitles: Record<string, Record<string, string>>;
	editingTodoEstimates: Record<string, Record<string, string>>;
	onSubTitleChange: (subtaskId: string, title: string) => void;
	onTodoTitleChange: (subtaskId: string, todoId: string, title: string) => void;
	onTodoEstimateChange: (
		subtaskId: string,
		todoId: string,
		estimate: string
	) => void;
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
	onDeleteTodoComment?: (
		subtaskId: string,
		todoId: string,
		commentId: string
	) => void;
}

export default function SortableSubTasksContainer({
	subtasks,
	parent,
	openTodos,
	onToggleTodos,
	onToggleTodo,
	onEditSub,
	onSaveSub,
	onCancelSub,
	onDeleteTodo,
	onReorderSubtasks,
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
	// コメント関連のprops
	subtaskComments,
	onAddSubtaskComment,
	onDeleteSubtaskComment,
	todoComments,
	onAddTodoComment,
	onDeleteTodoComment,
}: SortableSubTasksContainerProps) {
	// サブタスクをsort_order順にソート
	const sortedSubtasks = useMemo(() => {
		return [...subtasks].sort((a, b) => {
			const orderA = a.sort_order || 0;
			const orderB = b.sort_order || 0;
			return orderA - orderB;
		});
	}, [subtasks]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = sortedSubtasks.findIndex(subtask => subtask.id === active.id);
			const newIndex = sortedSubtasks.findIndex(subtask => subtask.id === over?.id);

			const newOrder = arrayMove(sortedSubtasks, oldIndex, newIndex);
			onReorderSubtasks(newOrder);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<SortableContext items={sortedSubtasks} strategy={verticalListSortingStrategy}>
				<div className='space-y-4'>
					{sortedSubtasks.map(subtask => (
						<SortableSubTask
							key={subtask.id}
							subtask={subtask}
							_parent={parent}
							openTodos={openTodos}
							onToggleTodos={onToggleTodos}
							onToggleTodo={onToggleTodo}
							onEditSub={onEditSub}
							onSaveSub={onSaveSub}
							onCancelSub={onCancelSub}
							onDeleteTodo={onDeleteTodo}
							onReorderTodos={onReorderTodos}
							editingSub={editingSub}
							editingSubTitle={editingSubTitle}
							editingTodoTitles={editingTodoTitles}
							editingTodoEstimates={editingTodoEstimates}
							onSubTitleChange={onSubTitleChange}
							onTodoTitleChange={onTodoTitleChange}
							onTodoEstimateChange={onTodoEstimateChange}
							onAddTodo={onAddTodo}
							onSaveNewTodo={onSaveNewTodo}
							onCancelNewTodo={onCancelNewTodo}
							addingTodo={addingTodo}
							newTodoTitle={newTodoTitle}
							newTodoEstimate={newTodoEstimate}
							onNewTodoTitleChange={onNewTodoTitleChange}
							onNewTodoEstimateChange={onNewTodoEstimateChange}
							// コメント関連のprops
							subtaskComments={subtaskComments}
							onAddSubtaskComment={onAddSubtaskComment}
							onDeleteSubtaskComment={onDeleteSubtaskComment}
							todoComments={todoComments}
							onAddTodoComment={onAddTodoComment}
							onDeleteTodoComment={onDeleteTodoComment}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
