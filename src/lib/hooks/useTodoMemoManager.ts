import { useCallback, useMemo, useState } from 'react';

export interface TodoMemoStateItem {
	content: string;
	html: string;
	images: File[];
}

export interface TodoMemoStateMap {
	[todoId: string]: TodoMemoStateItem;
}

export interface UseTodoMemoManagerOptions {
	initial?: TodoMemoStateMap;
}

export interface UseTodoMemoManager {
	memos: TodoMemoStateMap;
	setInitial: (state: TodoMemoStateMap) => void;
	setContent: (todoId: string, content: string) => void;
	setHtml: (todoId: string, html: string) => void;
	addImage: (todoId: string, file: File) => void;
	deleteImage: (todoId: string, imageIndex: number) => void;
	deleteMemo: (todoId: string) => void;
	get: (todoId: string) => TodoMemoStateItem;
	exists: (todoId: string) => boolean;
	keys: string[];
}

export function useTodoMemoManager(options?: UseTodoMemoManagerOptions): UseTodoMemoManager {
	const [memos, setMemos] = useState<TodoMemoStateMap>(options?.initial ?? {});

	const setInitial = useCallback((state: TodoMemoStateMap): void => {
		setMemos(state);
	}, []);

	const ensure = useCallback((todoId: string): TodoMemoStateItem => {
		return memos[todoId] ?? { content: '', html: '', images: [] };
	}, [memos]);

	const setContent = useCallback((todoId: string, content: string): void => {
		setMemos((prev: TodoMemoStateMap) => ({
			...prev,
			[todoId]: { ...ensure(todoId), content },
		}));
	}, [ensure]);

	const setHtml = useCallback((todoId: string, html: string): void => {
		setMemos((prev: TodoMemoStateMap) => ({
			...prev,
			[todoId]: { ...ensure(todoId), html },
		}));
	}, [ensure]);

	const addImage = useCallback((todoId: string, file: File): void => {
		setMemos((prev: TodoMemoStateMap) => ({
			...prev,
			[todoId]: { ...ensure(todoId), images: [...ensure(todoId).images, file] },
		}));
	}, [ensure]);

	const deleteImage = useCallback((todoId: string, imageIndex: number): void => {
		setMemos((prev: TodoMemoStateMap) => ({
			...prev,
			[todoId]: {
				...ensure(todoId),
				images: ensure(todoId).images.filter((_: File, idx: number) => idx !== imageIndex),
			},
		}));
	}, [ensure]);

	const deleteMemo = useCallback((todoId: string): void => {
		setMemos((prev: TodoMemoStateMap) => {
			const next: TodoMemoStateMap = { ...prev };
			delete next[todoId];
			return next;
		});
	}, []);

	const keys = useMemo(() => Object.keys(memos), [memos]);

	const get = useCallback((todoId: string): TodoMemoStateItem => ensure(todoId), [ensure]);

	const exists = useCallback((todoId: string): boolean => Object.prototype.hasOwnProperty.call(memos, todoId), [memos]);

	return { memos, setInitial, setContent, setHtml, addImage, deleteImage, deleteMemo, get, exists, keys };
}
