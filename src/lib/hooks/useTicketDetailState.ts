import { useState, useEffect } from 'react';
import type { ParentTask, SubTask, SubTodo } from '../../types';

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] };

export function useTicketDetailState(parent: ParentTask, subtasks: SubTask[]) {
	// Basic state
	const [editableTitle, setEditableTitle] = useState<string>(parent.title);
	const [editableDesc, setEditableDesc] = useState<string>(parent.description || '');
	const [editableDue, setEditableDue] = useState<string>(parent.due || '');
	const [dirty, setDirty] = useState<boolean>(false);
	const [currentProgress, setCurrentProgress] = useState<number>(0);

	// Subtasks state
	const [subs, setSubs] = useState<SubTaskWithLocal[]>(
		(subtasks || []).map((c) => ({
			...c,
			todos: (c.todos || []).map((t) => ({ ...t })),
		}))
	);

	// UI state
	const [openTodos, setOpenTodos] = useState<Record<number, boolean>>(() => {
		const map: Record<number, boolean> = {};
		for (const s of subtasks || []) map[s.id] = true;
		return map;
	});

	// Adding states
	const [addingSub, setAddingSub] = useState<boolean>(false);
	const [newSubTitle, setNewSubTitle] = useState<string>('');
	const [newSubDue, setNewSubDue] = useState<string>('');

	const [addingTodo, setAddingTodo] = useState<Record<number, boolean>>({});
	const [newTodoTitle, setNewTodoTitle] = useState<Record<number, string>>({});
	const [newTodoEstimate, setNewTodoEstimate] = useState<Record<number, string>>({});

	// Editing states
	const [editingSub, setEditingSub] = useState<Record<number, boolean>>({});
	const [editingSubTitle, setEditingSubTitle] = useState<Record<number, string>>({});
	const [editingTodoTitles, setEditingTodoTitles] = useState<Record<string, string>>({});
	const [editingTodoEstimates, setEditingTodoEstimates] = useState<Record<string, string>>({});

	// Initialize/reset when parent changes
	useEffect(() => {
		setEditableTitle(parent.title || '');
		setEditableDesc(parent.description || '');
		setEditableDue(parent.due || '');
		setSubs((subtasks || []).map((c) => ({ ...c, todos: (c.todos || []).map((t) => ({ ...t })) })));
		setOpenTodos(() => {
			const map: Record<number, boolean> = {};
			for (const s of subtasks || []) map[s.id] = true;
			return map;
		});
		setAddingSub(false);
		setNewSubTitle('');
		setNewSubDue('');
		setAddingTodo({});
		setNewTodoTitle({});
		setNewTodoEstimate({});
		setDirty(false);
	}, [parent.id, parent.title, parent.description, parent.due, subtasks]);

	// Recompute progress whenever subs change
	useEffect(() => {
		let total = 0, done = 0;
		subs.forEach(s => (s.todos || []).forEach(t => { total++; if (t.done) done++; }));
		setCurrentProgress(total > 0 ? Math.round((done / total) * 100) : 0);
	}, [subs]);

	return {
		// Basic state
		editableTitle,
		setEditableTitle,
		editableDesc,
		setEditableDesc,
		editableDue,
		setEditableDue,
		dirty,
		setDirty,
		currentProgress,
		setCurrentProgress,

		// Subtasks state
		subs,
		setSubs,

		// UI state
		openTodos,
		setOpenTodos,

		// Adding states
		addingSub,
		setAddingSub,
		newSubTitle,
		setNewSubTitle,
		newSubDue,
		setNewSubDue,
		addingTodo,
		setAddingTodo,
		newTodoTitle,
		setNewTodoTitle,
		newTodoEstimate,
		setNewTodoEstimate,

		// Editing states
		editingSub,
		setEditingSub,
		editingSubTitle,
		setEditingSubTitle,
		editingTodoTitles,
		setEditingTodoTitles,
		editingTodoEstimates,
		setEditingTodoEstimates,
	};
} 