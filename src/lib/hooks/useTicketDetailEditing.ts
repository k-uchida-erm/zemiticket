import type { SubTask, SubTodo } from '../../types';

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] };

export function useTicketDetailEditing() {
	function startEditingSub(
		subs: SubTaskWithLocal[],
		subtaskId: number,
		setEditingSub: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		setEditingSubTitle: React.Dispatch<React.SetStateAction<Record<number, string>>>,
		setEditingTodoTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>,
		setEditingTodoEstimates: React.Dispatch<React.SetStateAction<Record<string, string>>>
	) {
		const subIdx = subs.findIndex(s => s.id === subtaskId);
		if (subIdx === -1) return;
		
		const subtask = subs[subIdx];
		setEditingSub(prev => ({ ...prev, [subtaskId]: true }));
		setEditingSubTitle(prev => ({ ...prev, [subtaskId]: subtask.title }));
		
		if (subtask.todos) {
			subtask.todos.forEach(todo => {
				setEditingTodoTitles(prev => ({ ...prev, [`${subtaskId}-${todo.id}`]: todo.title }));
				setEditingTodoEstimates(prev => ({ ...prev, [`${subtaskId}-${todo.id}`]: String(todo.estimateHours || '') }));
			});
		}
	}

	function cancelEditingSub(
		subs: SubTaskWithLocal[],
		subtaskId: number,
		setEditingSub: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		setEditingSubTitle: React.Dispatch<React.SetStateAction<Record<number, string>>>,
		setEditingTodoTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>,
		setEditingTodoEstimates: React.Dispatch<React.SetStateAction<Record<string, string>>>
	) {
		setEditingSub(prev => ({ ...prev, [subtaskId]: false }));
		// Reset editing states for this subtask
		const subIdx = subs.findIndex(s => s.id === subtaskId);
		if (subIdx === -1) return;
		
		const subtask = subs[subIdx];
		setEditingSubTitle(prev => ({ ...prev, [subtaskId]: subtask.title }));
		if (subtask.todos) {
			subtask.todos.forEach(todo => {
				setEditingTodoTitles(prev => ({ ...prev, [`${subtaskId}-${todo.id}`]: todo.title }));
				setEditingTodoEstimates(prev => ({ ...prev, [`${subtaskId}-${todo.id}`]: String(todo.estimateHours || '') }));
			});
		}
	}

	return {
		startEditingSub,
		cancelEditingSub,
	};
} 