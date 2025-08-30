import type { ParentTask, SubTask, SubTodo } from '../../types';

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] };

export function useTicketDetailAPI() {
	// Header save/cancel handlers
	async function handleHeaderSave(
		parent: ParentTask,
		title: string,
		desc: string,
		due: string,
		setDirty: (dirty: boolean) => void
	) {
		try {
			const response = await fetch(`/api/parent-tasks/${parent.id}/update`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					title: title.trim(), 
					description: desc.trim(), 
					due_date: due || null 
				}),
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
			}
			setDirty(false);
			alert('変更が保存されました');
		} catch (error) {
			console.error('Failed to save changes:', error);
			alert(`保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	// Action handlers
	async function toggleTodo(
		subs: SubTaskWithLocal[],
		subIdx: number,
		todoId: number,
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>,
		setDirty: (dirty: boolean) => void
	) {
		// 現在のtodoの状態を先に取得
		const currentSub = subs[subIdx];
		const currentTodo = currentSub?.todos?.find(t => t.id === todoId);
		if (!currentTodo) return;
		
		const previousDone = currentTodo.done;
		const newDone = !previousDone;
		
		// 楽観的更新: 先にUIを更新
		setSubs((prev: SubTaskWithLocal[]) =>
			prev.map((s: SubTaskWithLocal, i: number) => {
				if (i !== subIdx) return s;
				return {
					...s,
					todos: (s.todos || []).map((t: SubTodo) => {
						if (t.id === todoId) {
							return { ...t, done: newDone };
						}
						return t;
					}),
				};
			})
		);
		setDirty(true);

		try {
			const response = await fetch(`/api/todos/update`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ todoId, done: newDone }),
			});
			if (!response.ok) throw new Error('Failed to update todo');
		} catch (error) {
			// 失敗時はロールバック
			setSubs((prev: SubTaskWithLocal[]) =>
				prev.map((s: SubTaskWithLocal, i: number) => {
					if (i !== subIdx) return s;
					return {
						...s,
						todos: (s.todos || []).map((t: SubTodo) => (t.id === todoId ? { ...t, done: previousDone ?? false } : t)),
					};
				})
			);
			console.error('Error updating todo:', error);
			alert('TODOの更新に失敗しました。');
		}
	}

	async function saveEditingSub(
		subs: SubTaskWithLocal[],
		subtaskId: number,
		editingSubTitle: Record<number, string>,
		editingTodoTitles: Record<string, string>,
		editingTodoEstimates: Record<string, string>,
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>,
		setEditingSub: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		setDirty: (dirty: boolean) => void
	) {
		const subIdx = subs.findIndex(s => s.id === subtaskId);
		if (subIdx === -1) return;
		
		const subtask = subs[subIdx];
		const newTitle = editingSubTitle[subtaskId];
		
		try {
			// Update subtask title
			if (newTitle && newTitle !== subtask.title) {
				const response = await fetch(`/api/sub-tasks/${subtask.id}/update`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: newTitle }),
				});
				if (!response.ok) throw new Error('Failed to update subtask');
			}

			// Update todos
			if (subtask.todos) {
				const updatePromises = subtask.todos.map(async (todo) => {
					const newTodoTitle = editingTodoTitles[`${subtaskId}-${todo.id}`];
					const newEstimate = editingTodoEstimates[`${subtaskId}-${todo.id}`];
					
					const hasChanges = 
						(newTodoTitle && newTodoTitle !== todo.title) ||
						(newEstimate !== String(todo.estimateHours || ''));
					
					if (hasChanges) {
						const estimate_hours = newEstimate === '' ? 0 : Number(newEstimate);
						const response = await fetch(`/api/todos/update`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ 
								todoId: todo.id,
								title: newTodoTitle || todo.title,
								estimate_hours 
							}),
						});
						if (!response.ok) throw new Error('Failed to update todo');
					}
				});
				await Promise.all(updatePromises);
			}

			// Update local state
			setSubs(prev => prev.map((s, i) => {
				if (i === subIdx) {
					return {
						...s,
						title: newTitle || s.title,
						todos: (s.todos || []).map(todo => ({
							...todo,
							title: editingTodoTitles[`${subtaskId}-${todo.id}`] || todo.title,
							estimateHours: editingTodoEstimates[`${subtaskId}-${todo.id}`] !== undefined 
								? (editingTodoEstimates[`${subtaskId}-${todo.id}`] === '' ? 0 : Number(editingTodoEstimates[`${subtaskId}-${todo.id}`]))
								: todo.estimateHours
						}))
					};
				}
				return s;
			}));

			setEditingSub(prev => ({ ...prev, [subtaskId]: false }));
			setDirty(true);
		} catch (error) {
			console.error('Error saving subtask:', error);
			alert('サブタスクの保存に失敗しました。');
		}
	}

	async function deleteTodo(
		subs: SubTaskWithLocal[],
		subIdx: number,
		todoId: number,
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>,
		setDirty: (dirty: boolean) => void
	) {
		try {
			const response = await fetch(`/api/todos/${todoId}`, {
				method: 'DELETE',
			});
			if (!response.ok) throw new Error('Failed to delete todo');
			
			setSubs(prev => prev.map((s, i) => 
				i === subIdx ? { ...s, todos: (s.todos || []).filter(t => t.id !== todoId) } : s
			));
			setDirty(true);
		} catch (error) {
			console.error('Error deleting todo:', error);
			alert('TODOの削除に失敗しました。');
		}
	}

	async function addTodo(
		subs: SubTaskWithLocal[],
		subIdx: number,
		newTodoTitle: Record<number, string>,
		newTodoEstimate: Record<number, string>,
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>,
		setAddingTodo: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		setNewTodoTitle: React.Dispatch<React.SetStateAction<Record<number, string>>>,
		setNewTodoEstimate: React.Dispatch<React.SetStateAction<Record<number, string>>>,
		setDirty: (dirty: boolean) => void
	) {
		const subtask = subs[subIdx];
		const title = (newTodoTitle[subtask.id] || '').trim();
		const estimateStr = newTodoEstimate[subtask.id] || '';
		
		if (!title) return;
		
		try {
			const response = await fetch('/api/todos/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sub_task_id: subtask.id,
					title,
					estimate_hours: estimateStr === '' ? 0 : Number(estimateStr),
				}),
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to create todo');
			}
			
			const newTodoApi = await response.json();
			const mapped = {
				id: newTodoApi.id,
				title: newTodoApi.title,
				estimateHours: newTodoApi.estimate_hours,
				done: newTodoApi.done || false,
			};
			
			setSubs(prev => prev.map((s, i) => 
				i === subIdx ? { ...s, todos: [...(s.todos || []), mapped] } : s
			));
			
			setAddingTodo(prev => ({ ...prev, [subtask.id]: false }));
			setNewTodoTitle(prev => ({ ...prev, [subtask.id]: '' }));
			setNewTodoEstimate(prev => ({ ...prev, [subtask.id]: '' }));
			setDirty(true);
		} catch (error) {
			console.error('Error creating todo:', error);
			alert('TODOの作成に失敗しました。');
		}
	}

	async function createSub(
		parent: ParentTask,
		newSubTitle: string,
		newSubDue: string,
		setSubs: React.Dispatch<React.SetStateAction<SubTaskWithLocal[]>>,
		setOpenTodos: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		setAddingSub: (addingSub: boolean) => void,
		setNewSubTitle: (newSubTitle: string) => void,
		setNewSubDue: (newSubDue: string) => void,
		setDirty: (dirty: boolean) => void
	) {
		const title = newSubTitle.trim();
		if (!title) return;
		
		try {
			const response = await fetch('/api/sub-tasks/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parent_task_id: parent.id,
					title,
					due_date: newSubDue || null,
				}),
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to create subtask');
			}
			
			const newSubApi = await response.json();
			const newSubLocal: SubTaskWithLocal = {
				id: newSubApi.id,
				title: newSubApi.title,
				user: parent.user,
				due: newSubApi.due_date,
				done: false,
				description: newSubApi.description || '',
				todos: [],
			};
			
			setSubs(prev => [...prev, newSubLocal]);
			setOpenTodos(prev => ({ ...prev, [newSubApi.id]: true }));
			setAddingSub(false);
			setNewSubTitle('');
			setNewSubDue('');
			setDirty(true);
		} catch (error) {
			console.error('Error creating subtask:', error);
			alert('サブタスクの作成に失敗しました。');
		}
	}

	return {
		handleHeaderSave,
		toggleTodo,
		saveEditingSub,
		deleteTodo,
		addTodo,
		createSub,
	};
} 