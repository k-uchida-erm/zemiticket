import type { SubTask, SubTodo } from '../../types';

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] };

export function useTicketDetailReorder() {
	// Reorder functions
	async function reorderSubtasks(
		newOrder: SubTaskWithLocal[],
		subtasks: SubTask[],
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>
	) {
		try {
			setSubs(newOrder);
			const updatePromises = newOrder.map((subtask, index) => {
				return fetch(`/api/sub-tasks/${subtask.id}/update`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sort_order: index + 1 }),
				});
			});
			await Promise.all(updatePromises);
		} catch (error) {
			console.error('Error reordering subtasks:', error);
			setSubs((subtasks || []).map((c) => ({ ...c, todos: (c.todos || []).map((t) => ({ ...t })) })));
			alert('サブタスクの並び替えに失敗しました。');
		}
	}

	async function reorderTodos(
		subtaskId: number,
		newOrder: SubTodo[],
		subtasks: SubTask[],
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>
	) {
		try {
			setSubs((prev) => prev.map((subtask) => {
				if (subtask.id === subtaskId) {
					return { ...subtask, todos: newOrder };
				}
				return subtask;
			}));
			
			const updatePromises = newOrder.map((todo, index) => {
				return fetch(`/api/todos/${todo.id}/update`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sort_order: index + 1 }),
				});
			});
			await Promise.all(updatePromises);
		} catch (error) {
			console.error('Error reordering todos:', error);
			setSubs((subtasks || []).map((c) => ({ ...c, todos: (c.todos || []).map((t) => ({ ...t })) })));
			alert('TODOの並び替えに失敗しました。');
		}
	}

	return {
		reorderSubtasks,
		reorderTodos,
	};
} 