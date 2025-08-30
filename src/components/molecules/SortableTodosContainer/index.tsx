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
import SortableTodo from '../../atoms/SortableTodo';
import CommentSection from '../CommentSection';
import { SubTodo } from '../../../types';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface SortableTodosContainerProps {
	todos: SubTodo[];
	subtaskId: number;
	isEditing: boolean;
	editingTodoTitles: Record<number, string>;
	editingTodoEstimates: Record<number, string>;
	onToggle: (subtaskId: number, todoId: number) => void;
	onTitleChange: (subtaskId: number, todoId: number, title: string) => void;
	onEstimateChange: (subtaskId: number, todoId: number, estimate: string) => void;
	onDelete: (subtaskId: number, todoId: number) => void;
	onReorderTodos: (subtaskId: number, newOrder: SubTodo[]) => void;
	// コメント関連のprops
	todoComments?: Record<number, Comment[]>;
	onAddTodoComment?: (subtaskId: number, todoId: number, text: string) => void;
	onDeleteTodoComment?: (subtaskId: number, todoId: number, commentId: string) => void;
}

export default function SortableTodosContainer({
	todos,
	subtaskId,
	isEditing,
	editingTodoTitles,
	editingTodoEstimates,
	onToggle,
	onTitleChange,
	onEstimateChange,
	onDelete,
	onReorderTodos,
	todoComments,
	onAddTodoComment,
	onDeleteTodoComment
}: SortableTodosContainerProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		if (!isEditing) return;
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = todos.findIndex((todo) => `todo-${todo.id}` === active.id);
			const newIndex = todos.findIndex((todo) => `todo-${todo.id}` === over?.id);

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
			<SortableContext items={todos.map(todo => `todo-${todo.id}`)} strategy={verticalListSortingStrategy}>
				<div className="space-y-1">
					{todos.map((todo) => (
						<div key={todo.id}>
							<SortableTodo
								todo={todo}
								subtaskId={subtaskId}
								isEditing={isEditing}
								editingTitle={editingTodoTitles[todo.id] || todo.title}
								editingEstimate={editingTodoEstimates[todo.id] || (todo.estimateHours?.toString() || '')}
								onToggle={onToggle}
								onTitleChange={onTitleChange}
								onEstimateChange={onEstimateChange}
								onDelete={onDelete}
							/>
							
							{/* TODOコメントセクション */}
							{todoComments && todoComments[todo.id] && todoComments[todo.id].length > 0 && (
								<div className="ml-6 mt-2">
									<CommentSection
										comments={todoComments[todo.id]}
										onAddComment={(text: string) => onAddTodoComment?.(subtaskId, todo.id, text)}
										onDeleteComment={(commentId: string) => onDeleteTodoComment?.(subtaskId, todo.id, commentId)}
										title="Todo Comments"
										compact={true}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
} 
 
 
 
 
 
 
 
 
 
 
 
 