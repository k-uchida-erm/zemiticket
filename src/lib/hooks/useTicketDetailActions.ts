import { useCallback } from 'react';
import type { SubTask, SubTodo, ParentTask } from '../../types';

interface UseTicketDetailActionsParams {
	parent: ParentTask;
	subs: (SubTask & { todos?: SubTodo[] })[];
	setSubs: React.Dispatch<React.SetStateAction<(SubTask & { todos?: SubTodo[] })[]>>;
	setEditingSub: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
	setEditingSubTitle: React.Dispatch<React.SetStateAction<Record<number, string>>>;
	setEditingTodoTitles: React.Dispatch<React.SetStateAction<Record<number, Record<number, string>>>>;
	setEditingTodoEstimates: React.Dispatch<React.SetStateAction<Record<number, Record<number, string>>>>;
	editingSubTitle: Record<number, string>;
	editingTodoTitles: Record<number, Record<number, string>>;
	editingTodoEstimates: Record<number, Record<number, string>>;
	// for create/add todo
	setOpenTodos?: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
	newSubTitle?: string;
	setNewSubTitle?: (v: string) => void;
	setNewSubDue?: (v: string) => void;
	setAddingSub?: (v: boolean) => void;
	newTodoTitle?: Record<number, string>;
	newTodoEstimate?: Record<number, string>;
	setAddingTodo?: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
	setNewTodoTitle?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
	setNewTodoEstimate?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export function useTicketDetailActions(params: UseTicketDetailActionsParams) {
	const { parent, subs, setSubs, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates, editingSubTitle, editingTodoTitles, editingTodoEstimates, setOpenTodos, newSubTitle, setNewSubTitle, setNewSubDue, setAddingSub, newTodoTitle, newTodoEstimate, setAddingTodo, setNewTodoTitle, setNewTodoEstimate } = params;

	const toggleTodo = useCallback((subIdx: number, todoId: number) => {
		return async () => {
			try {
				const sub = subs[subIdx];
				const todo = sub.todos?.find(t => t.id === todoId);
				if (!todo) return;
				const newDoneState = !todo.done;
				const response = await fetch(`/api/todos/update`, {
					method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ todoId, done: newDoneState })
				});
				if (!response.ok) throw new Error('Failed to update todo');
				setSubs((prev) => prev.map((s, i) => i === subIdx ? { ...s, todos: (s.todos || []).map((t) => t.id === todoId ? { ...t, done: newDoneState } : t) } : s));
				window.dispatchEvent(new CustomEvent('todoProgressUpdated', { detail: { parentTaskId: parent.id } }));
			} catch (error) { console.error('Error updating todo:', error); alert('todoの更新に失敗しました。'); }
		};
	}, [subs, parent.id, setSubs]);

	const startEditingSub = useCallback((subIdx: number) => {
		const sub = subs[subIdx];
		setEditingSub((prev) => ({ ...prev, [sub.id]: true }));
		setEditingSubTitle((prev) => ({ ...prev, [sub.id]: sub.title }));
		const todoTitles: Record<number, string> = {};
		const todoEstimates: Record<number, string> = {};
		sub.todos?.forEach(todo => { todoTitles[todo.id] = todo.title; todoEstimates[todo.id] = (todo.estimateHours ?? '').toString(); });
		setEditingTodoTitles((prev) => ({ ...prev, [sub.id]: todoTitles }));
		setEditingTodoEstimates((prev) => ({ ...prev, [sub.id]: todoEstimates }));
	}, [subs, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates]);

	const saveEditingSub = useCallback(async (subIdx: number) => {
		const sub = subs[subIdx];
		const newTitle = editingSubTitle[sub.id];
		const todoTitles = editingTodoTitles[sub.id] || {};
		const todoEstimates = editingTodoEstimates[sub.id] || {};
		if (!newTitle || !newTitle.trim()) return;
		try {
			const response = await fetch(`/api/sub-tasks/${sub.id}/update`, {
				method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle.trim() })
			});
			if (!response.ok) throw new Error('Failed to update sub task');
			const todoUpdatePromises = (sub.todos || []).map(async (todo) => {
				const newTodoTitle = todoTitles[todo.id];
				const newEstimateRaw = todoEstimates[todo.id];
				const parsedEstimate = newEstimateRaw === undefined ? undefined : (newEstimateRaw === '' ? 0 : Number(newEstimateRaw));
				const currentEstimate = todo.estimateHours ?? 0;
				const shouldUpdateTitle = newTodoTitle !== undefined && newTodoTitle.trim() !== todo.title;
				const shouldUpdateEstimate = parsedEstimate !== undefined && parsedEstimate !== currentEstimate;
				if (shouldUpdateTitle || shouldUpdateEstimate) {
					const body: any = {};
					if (shouldUpdateTitle) body.title = newTodoTitle.trim();
					if (shouldUpdateEstimate) body.estimate_hours = parsedEstimate;
					const todoResponse = await fetch(`/api/todos/${todo.id}/update`, {
						method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
					});
					if (!todoResponse.ok) throw new Error(`Failed to update todo ${todo.id}`);
				}
			});
			await Promise.all(todoUpdatePromises);
			setSubs((prev) => prev.map((s, i) => i === subIdx ? {
				...s,
				title: newTitle.trim(),
				todos: (s.todos || []).map(todo => {
					const hasNewEstimate = Object.prototype.hasOwnProperty.call(todoEstimates, todo.id);
					const nextEstimate = hasNewEstimate ? (todoEstimates[todo.id] === '' ? 0 : Number(todoEstimates[todo.id])) : todo.estimateHours;
					return {
						...todo,
						title: (todoTitles[todo.id] !== undefined && todoTitles[todo.id].trim() !== '') ? todoTitles[todo.id] : todo.title,
						estimateHours: nextEstimate,
					};
				})
			} : s));
			setEditingSub((prev) => ({ ...prev, [sub.id]: false }));
			setEditingSubTitle((prev) => ({ ...prev, [sub.id]: '' }));
			setEditingTodoTitles((prev) => ({ ...prev, [sub.id]: {} }));
			setEditingTodoEstimates((prev) => ({ ...prev, [sub.id]: {} }));
			window.dispatchEvent(new CustomEvent('todoProgressUpdated', { detail: { parentTaskId: parent.id } }));
		} catch (error) { console.error('Error updating sub task:', error); alert('サブタスクの更新に失敗しました。'); }
	}, [subs, editingSubTitle, editingTodoTitles, editingTodoEstimates, setSubs, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates, parent.id]);

	const cancelEditingSub = useCallback((subIdx: number) => {
		const sub = subs[subIdx];
		setEditingSub((prev) => ({ ...prev, [sub.id]: false }));
		setEditingSubTitle((prev) => ({ ...prev, [sub.id]: '' }));
		setEditingTodoTitles((prev) => ({ ...prev, [sub.id]: {} }));
		setEditingTodoEstimates((prev) => ({ ...prev, [sub.id]: {} }));
	}, [subs, setEditingSub, setEditingSubTitle, setEditingTodoTitles, setEditingTodoEstimates]);

	const deleteTodo = useCallback((subIdx: number, todoId: number) => {
		return async () => {
			try {
				const response = await fetch(`/api/todos/${todoId}/delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
				if (!response.ok) throw new Error('Failed to delete todo');
				setSubs((prev) => prev.map((s, i) => i === subIdx ? { ...s, todos: (s.todos || []).filter((t) => t.id !== todoId) } : s));
				window.dispatchEvent(new CustomEvent('todoProgressUpdated', { detail: { parentTaskId: parent.id } }));
			} catch (error) { console.error('Error deleting todo:', error); alert('todoの削除に失敗しました。'); }
		};
	}, [subs, parent.id, setSubs]);

	const reorderSubtasks = useCallback(async (newOrder: (SubTask & { todos?: SubTodo[] })[]) => {
		try {
			setSubs(newOrder);
			const updatePromises = newOrder.map((subtask, index) => fetch(`/api/sub-tasks/${subtask.id}/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: index + 1 }) }));
			await Promise.all(updatePromises);
		} catch (error) { console.error('Error reordering subtasks:', error); alert('サブタスクの並び替えに失敗しました。'); }
	}, [setSubs]);

	const reorderTodos = useCallback(async (subtaskId: number, newOrder: SubTodo[]) => {
		try {
			setSubs((prev) => prev.map((s) => s.id === subtaskId ? { ...s, todos: newOrder } : s));
			const updatePromises = newOrder.map((todo, index) => fetch(`/api/todos/${todo.id}/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: index + 1 }) }));
			await Promise.all(updatePromises);
		} catch (error) { console.error('Error reordering todos:', error); alert('TODOの並び替えに失敗しました。'); }
	}, [setSubs]);

	const createSub = useCallback(async () => {
		const title = (newSubTitle || '').trim();
		if (!title) return;
		try {
			const response = await fetch('/api/sub-tasks/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parent_task_id: parent.id, title, due_date: null }) });
			if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`); }
			const result = await response.json();
			const newSubTask = result.data;
			setSubs((prev) => [ ...prev, { ...newSubTask, user: parent.user, description: '', todos: [] } ]);
			setOpenTodos && setOpenTodos((p) => ({ ...p, [newSubTask.id]: true }));
			setAddingSub && setAddingSub(false);
			setNewSubTitle && setNewSubTitle('');
			setNewSubDue && setNewSubDue('');
		} catch (error) { console.error('Error creating sub task:', error); alert('サブタスクの作成に失敗しました。'); }
	}, [newSubTitle, parent.id, parent.user, setSubs, setOpenTodos, setAddingSub, setNewSubTitle, setNewSubDue]);

	const addTodo = useCallback(async (subIdx: number, subId: number) => {
		const title = ((newTodoTitle && newTodoTitle[subId]) || '').trim();
		if (!title) return;
		const estimateHours = newTodoEstimate && newTodoEstimate[subId] ? (newTodoEstimate[subId] === '' ? 0 : Number(newTodoEstimate[subId])) : 0;
		try {
			const response = await fetch('/api/todos/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub_task_id: subId, title, estimate_hours: estimateHours }) });
			if (!response.ok) throw new Error('Failed to create todo');
			const result = await response.json();
			const newTodoApi = result.data;
			// map API snake_case to frontend camelCase
			const mapped: SubTodo = {
				id: newTodoApi.id,
				title: newTodoApi.title,
				done: newTodoApi.done,
				due: newTodoApi.due_date || undefined,
				estimateHours: newTodoApi.estimate_hours ?? 0,
				inProgress: newTodoApi.in_progress || false,
				sort_order: newTodoApi.sort_order,
			};
			setSubs((prev) => prev.map((s, i) => i === subIdx ? { ...s, todos: [...(s.todos || []), mapped] } : s));
			setAddingTodo && setAddingTodo((p) => ({ ...p, [subId]: false }));
			setNewTodoTitle && setNewTodoTitle((p) => ({ ...p, [subId]: '' }));
			setNewTodoEstimate && setNewTodoEstimate((p) => ({ ...p, [subId]: '' }));
		} catch (error) { console.error('Error creating todo:', error); alert('Failed to create todo. Please try again.'); }
	}, [newTodoTitle, newTodoEstimate, setSubs, setAddingTodo, setNewTodoTitle, setNewTodoEstimate]);

	return { toggleTodo, startEditingSub, saveEditingSub, cancelEditingSub, deleteTodo, reorderSubtasks, reorderTodos, createSub, addTodo };
} 
 
 
 
 
 
 
 
 
 
 
 
 
 