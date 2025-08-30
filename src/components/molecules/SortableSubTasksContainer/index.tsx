"use client";

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableSubTask from '../SortableSubTask';
import CommentSection from '../CommentSection';
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
	openTodos: Record<number, boolean>;
	onToggleTodos: (subtaskId: number) => void;
	onToggleTodo: (subtaskId: number, todoId: number) => void;
	onEditSub: (subtaskId: number) => void;
	onSaveSub: (subtaskId: number) => void;
	onCancelSub: (subtaskId: number) => void;
	onDeleteTodo: (subtaskId: number, todoId: number) => void;
	onReorderSubtasks: (newOrder: (SubTask & { todos?: SubTodo[] })[]) => void;
	onReorderTodos: (subtaskId: number, newOrder: SubTodo[]) => void;
	editingSub: Record<number, boolean>;
	editingSubTitle: Record<number, string>;
	editingTodoTitles: Record<number, Record<number, string>>;
	editingTodoEstimates: Record<number, Record<number, string>>;
	onSubTitleChange: (subtaskId: number, title: string) => void;
	onTodoTitleChange: (subtaskId: number, todoId: number, title: string) => void;
	onTodoEstimateChange: (subtaskId: number, todoId: number, estimate: string) => void;
	onAddTodo: (subtaskId: number) => void;
	onSaveNewTodo: (subtaskId: number) => void;
	onCancelNewTodo: (subtaskId: number) => void;
	addingTodo: Record<number, boolean>;
	newTodoTitle: Record<number, string>;
	newTodoEstimate: Record<number, string>;
	onNewTodoTitleChange: (subtaskId: number, title: string) => void;
	onNewTodoEstimateChange: (subtaskId: number, estimate: string) => void;
	// コメント関連のprops
	subtaskComments?: Record<number, Comment[]>;
	onAddSubtaskComment?: (subtaskId: number, text: string) => void;
	onDeleteSubtaskComment?: (subtaskId: number, commentId: string) => void;
	todoComments?: Record<number, Comment[]>;
	onAddTodoComment?: (subtaskId: number, todoId: number, text: string) => void;
	onDeleteTodoComment?: (subtaskId: number, todoId: number, commentId: string) => void;
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
	onDeleteTodoComment
}: SortableSubTasksContainerProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = subtasks.findIndex((subtask) => subtask.id === active.id);
			const newIndex = subtasks.findIndex((subtask) => subtask.id === over?.id);

			const newOrder = arrayMove(subtasks, oldIndex, newIndex);
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
			<SortableContext items={subtasks} strategy={verticalListSortingStrategy}>
				<div className="space-y-4">
					{subtasks.map((subtask) => (
						<SortableSubTask
							key={subtask.id}
							subtask={subtask}
							parent={parent}
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
 
 
 
 
 
 
 
 
 
 
 
 