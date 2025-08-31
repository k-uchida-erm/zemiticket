import { useEffect, useState } from 'react';
import type { ParentTask, SubTask, SubTodo } from '../../types';

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] };

export function useTicketDetailState(
	parent: ParentTask,
	subtasks?: SubTask[]
) {
	// Basic state
	const [editableTitle, setEditableTitle] = useState(parent.title || '');
	const [editableDesc, setEditableDesc] = useState(parent.description || '');
	const [editableDue, setEditableDue] = useState(parent.due || '');
	const [dirty, setDirty] = useState(false);
	const [currentProgress, setCurrentProgress] = useState(0);

	// Subtasks state
	const [subs, setSubs] = useState<SubTaskWithLocal[]>(
		(subtasks || [])
			.map(c => ({
				...c,
				todos: (c.todos || []).map(t => ({ ...t })),
			}))
			.sort((a, b) => {
				const orderA = a.sort_order || 0;
				const orderB = b.sort_order || 0;
				return orderA - orderB;
			})
	);

	// UI state
	const [openTodos, setOpenTodos] = useState<Record<string, boolean>>({});

	// Adding states
	const [addingSub, setAddingSub] = useState(false);
	const [newSubTitle, setNewSubTitle] = useState('');
	const [newSubDue, setNewSubDue] = useState('');
	const [addingTodo, setAddingTodo] = useState<Record<string, boolean>>({});
	const [newTodoTitle, setNewTodoTitle] = useState<Record<string, string>>({});
	const [newTodoEstimate, setNewTodoEstimate] = useState<
		Record<string, string>
	>({});

	// Editing states
	const [editingSub, setEditingSub] = useState<Record<string, boolean>>({});
	const [editingSubTitle, setEditingSubTitle] = useState<
		Record<string, string>
	>({});
	const [editingTodoTitles, setEditingTodoTitles] = useState<
		Record<string, Record<string, string>>
	>({});
	const [editingTodoEstimates, setEditingTodoEstimates] = useState<
		Record<string, Record<string, string>>
	>({});

	// Initialize/reset when parent changes
	useEffect(() => {
		setEditableTitle(parent.title || '');
		setEditableDesc(parent.description || '');
		setEditableDue(parent.due || '');
		setSubs(
			(subtasks || [])
				.map(c => ({
					...c,
					todos: (c.todos || []).map(t => ({ ...t })),
				}))
				.sort((a, b) => {
					const orderA = a.sort_order || 0;
					const orderB = b.sort_order || 0;
					return orderA - orderB;
				})
		);
		setOpenTodos(() => {
			const map: Record<string, boolean> = {};
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
	}, [parent.id, parent.title, parent.description, parent.due]);

	// Recompute progress whenever subs change
	useEffect(() => {
		let total = 0,
			done = 0;
		subs.forEach((s: SubTaskWithLocal) =>
			(s.todos || []).forEach((t: SubTodo) => {
				total++;
				if (t.done) done++;
			})
		);
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

		// Adding todo states
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
