import { useEffect, useCallback } from 'react';
import type { ParentTask, SubTask, SubTodo } from '../../types';

interface UseTicketDetailDataParams {
	parent: ParentTask;
	subtasks: SubTask[] | undefined;
	subs: (SubTask & { todos?: SubTodo[] })[];
	setSubs: React.Dispatch<React.SetStateAction<(SubTask & { todos?: SubTodo[] })[]>>;
	setOpenTodos: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
	titleRef: React.RefObject<HTMLDivElement | null>;
	descRef: React.RefObject<HTMLDivElement | null>;
	setEditableTitle: (v: string) => void;
	setEditableDesc: (v: string) => void;
	setEditableDue: (v: string) => void;
	setAddingSub: (v: boolean) => void;
	setNewSubTitle: (v: string) => void;
	setNewSubDue: (v: string) => void;
	setAddingTodo: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
	setNewTodoTitle: React.Dispatch<React.SetStateAction<Record<number, string>>>;
	setNewTodoEstimate: React.Dispatch<React.SetStateAction<Record<number, string>>>;
	setDirty: (v: boolean) => void;
	setCurrentProgress: (v: number) => void;
}

export function useTicketDetailData(params: UseTicketDetailDataParams) {
	const { parent, subtasks, subs, setSubs, setOpenTodos, titleRef, descRef, setEditableTitle, setEditableDesc, setEditableDue, setAddingSub, setNewSubTitle, setNewSubDue, setAddingTodo, setNewTodoTitle, setNewTodoEstimate, setDirty, setCurrentProgress } = params;

	// initialize/reset when parent changes
	useEffect(() => {
		if (titleRef.current) titleRef.current.innerText = parent.title || '';
		if (descRef.current) descRef.current.innerText = parent.description || '';
		setEditableTitle(parent.title || '');
		setEditableDesc(parent.description || '');
		setEditableDue((parent as any).due || '');
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
	}, [parent.id, parent.title, parent.description, (parent as any).due, subtasks]);

	// recompute progress whenever subs change
	useEffect(() => {
		let total = 0, done = 0;
		subs.forEach(s => (s.todos || []).forEach(t => { total++; if (t.done) done++; }));
		setCurrentProgress(total > 0 ? Math.round((done / total) * 100) : 0);
	}, [subs, setCurrentProgress]);
} 
 
 
 
 
 
 
 
 
 
 
 
 
 