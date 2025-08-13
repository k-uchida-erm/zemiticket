"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ParentTask, SubTask, SubTodo } from '../../../types';
import ProgressBar from '../../atoms/ProgressBar';
import StatusDot from '../../atoms/StatusDot';
import IconClose from '../../atoms/icons/Close';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import IconPlus from '../../atoms/icons/Plus';

interface TicketDetailPanelProps {
	parent: ParentTask;
	children: SubTask[];
	onClose?: () => void;
	onSave?: (data: { title: string; description?: string; due?: string; subs: SubTaskWithLocal[] }) => void;
	onToggleFullscreen?: () => void;
	isFullscreen?: boolean;
}

export default function TicketDetailPanel({ parent, children, onClose, onSave, onToggleFullscreen, isFullscreen = false }: TicketDetailPanelProps) {
	const [editableTitle, setEditableTitle] = useState<string>(parent.title);
	const [editableDesc, setEditableDesc] = useState<string>(parent.description || '');
	const [editableDue, setEditableDue] = useState<string>(parent.due || '');
	const [subs, setSubs] = useState<SubTaskWithLocal[]>(
		(children || []).map((c) => ({
			...c,
			todos: (c.todos || []).map((t) => ({ ...t })),
		}))
	);
	const [dirty, setDirty] = useState<boolean>(false);

	const [openTodos, setOpenTodos] = useState<Record<number, boolean>>(() => {
		const map: Record<number, boolean> = {};
		for (const s of children || []) map[s.id] = true;
		return map;
	});
	const [addingSub, setAddingSub] = useState<boolean>(false);
	const [newSubTitle, setNewSubTitle] = useState<string>('');
	const [newSubDue, setNewSubDue] = useState<string>('');
	const [newSubEstimate, setNewSubEstimate] = useState<string>('');

	const [addingTodo, setAddingTodo] = useState<Record<number, boolean>>({});
	const [newTodoTitle, setNewTodoTitle] = useState<Record<number, string>>({});
	const [newTodoEstimate, setNewTodoEstimate] = useState<Record<number, string>>({});

	const titleRef = useRef<HTMLDivElement>(null);
	const descRef = useRef<HTMLDivElement>(null);

	// Initialize contentEditable fields on mount/when parent changes
	useEffect(() => {
		if (titleRef.current) titleRef.current.innerText = parent.title || '';
		if (descRef.current) descRef.current.innerText = parent.description || '';
		setEditableTitle(parent.title || '');
		setEditableDesc(parent.description || '');
		setEditableDue(parent.due || '');
		setSubs((children || []).map((c) => ({ ...c, todos: (c.todos || []).map((t) => ({ ...t })) })));
		setOpenTodos(() => {
			const map: Record<number, boolean> = {};
			for (const s of children || []) map[s.id] = true;
			return map;
		});
		setAddingSub(false);
		setNewSubTitle('');
		setNewSubDue('');
		setNewSubEstimate('');
		setAddingTodo({});
		setNewTodoTitle({});
		setNewTodoEstimate({});
		setDirty(false);
	// include parent fields and children to satisfy exhaustive-deps
	}, [parent.id, parent.title, parent.description, parent.due, children]);

	const computedProgress = useMemo(() => {
		if (typeof parent.progressPercentage === 'number') return parent.progressPercentage;
		return calcProgress(subs);
	}, [parent.progressPercentage, subs]);

	const computeSubHours = (s: SubTaskWithLocal) => {
		if (!Array.isArray(s.todos)) return 0;
		return s.todos.reduce((sum, t) => sum + (typeof t.estimateHours === 'number' ? t.estimateHours : 0), 0);
	};

	const parentHours = useMemo(() => {
		if (typeof parent.estimateHours === 'number') return parent.estimateHours;
		return subs.reduce((acc, s) => acc + computeSubHours(s), 0);
	}, [parent.estimateHours, subs]);

	return (
		<div className="pt-0 pb-4 relative">
			{/* Top-right actions */}
			<div className="absolute top-0 right-0 flex items-center gap-2">
				{dirty && (
					<>
						<button onClick={() => { const title = titleRef.current?.innerText ?? editableTitle; const desc = descRef.current?.innerText ?? editableDesc; onSave?.({ title, description: desc || undefined, due: editableDue || undefined, subs }); setDirty(false); }} className="px-3 py-1.5 text-[12px] rounded bg-[#00b393] text-white">Save</button>
						<button onClick={() => { if (titleRef.current) titleRef.current.innerText = parent.title || ''; if (descRef.current) descRef.current.innerText = parent.description || ''; setEditableTitle(parent.title || ''); setEditableDesc(parent.description || ''); setEditableDue(parent.due || ''); setSubs((children || []).map((c) => ({ ...c, todos: (c.todos || []).map((t) => ({ ...t })) }))); setDirty(false); setAddingSub(false); setNewSubTitle(''); setNewSubDue(''); setNewSubEstimate(''); setAddingTodo({}); setNewTodoTitle({}); setNewTodoEstimate({}); }} className="px-3 py-1.5 text-[12px] rounded border border-neutral-300 text-neutral-700 bg-white">Cancel</button>
					</>
				)}
				<button onClick={onToggleFullscreen} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-50 text-neutral-600" aria-label="Toggle fullscreen">
					<span className="[&_svg]:w-4 [&_svg]:h-4">{isFullscreen ? <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 9 15 3 21 3'/><polyline points='9 15 3 15 3 21'/><polyline points='21 9 21 3 15 3'/><polyline points='3 21 9 21 9 15'/></svg> : <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 3 21 3 21 9'/><polyline points='9 21 3 21 3 15'/><polyline points='21 15 21 21 15 21'/><polyline points='3 9 3 3 9 3'/></svg>}</span>
				</button>
				<button onClick={onClose} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-50 text-neutral-600" aria-label="Close">
					<IconClose />
				</button>
			</div>

			{/* Epic name */}
			<div className="mt-0">
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center text-[12px] px-2 py-[2px] rounded-full border border-neutral-300 text-neutral-700 bg-white">
						{parent.epic || '未分類'}
					</span>
					{parentHours > 0 && (
						<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-indigo-700 text-white">{parentHours}h</span>
					)}
				</div>
			</div>

			{/* Inline editable title */}
			<div className="mt-3">
				<div
					role="textbox"
					contentEditable
					suppressContentEditableWarning
					onInput={(e) => { setEditableTitle((e.target as HTMLElement).innerText); setDirty(true); }}
					ref={titleRef}
					className="outline-none focus:outline-none text-[20px] leading-7 font-semibold text-neutral-900"
					aria-label="Title"
				></div>
			</div>

			{/* Inline editable description */}
			<div className="mt-2">
				<div
					role="textbox"
					contentEditable
					suppressContentEditableWarning
					onInput={(e) => { setEditableDesc((e.target as HTMLElement).innerText); setDirty(true); }}
					ref={descRef}
					className="outline-none focus:outline-none text-[13px] leading-6 text-neutral-700 whitespace-pre-wrap"
					aria-label="Description"
				></div>
			</div>

			{/* Due (minimal date picker) */}
			<div className="mt-4">
				<div className="text-[11px] text-neutral-600 mb-1">Due</div>
				<input
					type="date"
					value={editableDue}
					onChange={(e) => { setEditableDue(e.target.value); setDirty(true); }}
					className="border border-neutral-300 rounded px-2 py-1 text-[13px] w-[160px]"
				/>
			</div>

			{/* Progress (auto) */}
			<div className="mt-4">
				<div className="text-[11px] text-neutral-600 mb-1">Progress</div>
				<ProgressBar percentage={computedProgress} />
				<div className="mt-1 text-[12px] text-neutral-700">{computedProgress}%</div>
			</div>

			{/* Sub tickets */}
			<div className="mt-5">
				<div className="text-[11px] text-neutral-600 mb-2">Sub tickets</div>
				<div className="space-y-2">
					{subs.map((s, idx) => (
						<div key={s.id} className="border border-neutral-200 rounded">
							<div className="flex items-center justify-between gap-3 px-2 py-2">
								<div className="flex items-center gap-2 min-w-0">
									<StatusDot completed={!!s.done} variant="todo" onClick={() => { toggleSub(idx)(); setDirty(true); }} />
									<div className="min-w-0">
										<div className="flex items-center gap-1 min-w-0">
											<div className="text-[13px] text-neutral-900 truncate">{s.title}</div>
											{Array.isArray(s.todos) && s.todos.length > 0 && (
												<button type="button" onClick={() => setOpenTodos((prev) => ({ ...prev, [s.id]: !prev[s.id] }))} className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-neutral-50 text-neutral-600 shrink-0" aria-label="Toggle subtodos">
													<IconChevronDown className={`w-3.5 h-3.5 transition-transform ${openTodos[s.id] ? 'rotate-180' : ''}`} />
												</button>
											)}
											{computeSubHours(s) > 0 && (
												<span className="ml-1 shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white">{computeSubHours(s)}h</span>
											)}
										</div>
									</div>
								</div>
								<div className="shrink-0">
									<input
										type="date"
										value={s.due || ''}
										onChange={(e) => { const v = e.target.value; setSubs((prev) => prev.map((sub, i) => (i === idx ? { ...sub, due: v } : sub))); setDirty(true); }}
										className="border border-neutral-300 rounded px-1.5 py-[2px] text-[11px] w-[140px]"
									/>
								</div>
							</div>
							{openTodos[s.id] && subTodoBlock(s, idx)}
						</div>
					))}
					{/* Add sub-ticket row */}
					<div className="pt-2">
						{!addingSub ? (
							<div className="flex items-center justify-start">
								<button onClick={() => setAddingSub(true)} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700">
									<span className="[&_svg]:w-3.5 [&_svg]:h-3.5"><IconPlus /></span>
									<span>Sub ticket</span>
								</button>
							</div>
						) : (
							<div className="border border-dashed border-neutral-300 rounded px-2 py-2">
								<div className="flex items-center justify-between gap-2">
									<input value={newSubTitle} onChange={(e) => { setNewSubTitle(e.target.value); setDirty(true); }} placeholder="Sub ticket title" className="flex-1 min-w-0 border border-neutral-300 rounded px-2 py-1 text-[12px]" />
									<div className="flex items-center gap-2">
										<input type="date" value={newSubDue} onChange={(e) => { setNewSubDue(e.target.value); setDirty(true); }} className="border border-neutral-300 rounded px-2 py-1 text-[12px] w-[150px]" />
										<div className="flex items-center">
											<input type="number" min={0} step={0.5} value={newSubEstimate} onChange={(e) => { setNewSubEstimate(e.target.value); setDirty(true); }} className="w-12 focus:w-16 transition-all border border-neutral-300 rounded px-1.5 py-[2px] text-[11px] text-right" />
											<span className="ml-1 text-[11px] text-neutral-500">h</span>
										</div>
										<button onClick={() => { setAddingSub(false); setNewSubTitle(''); setNewSubDue(''); setNewSubEstimate(''); }} className="px-2 py-1 text-[12px] rounded border border-neutral-300 text-neutral-700">Cancel</button>
										<button onClick={createSub} className="px-2 py-1 text-[12px] rounded bg-[#00b393] text-white">Add</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	function subTodoBlock(s: SubTaskWithLocal, idx: number) {
		if (!Array.isArray(s.todos) || s.todos.length === 0) return (
			<div className="border-t border-neutral-200 pl-6 pr-2 py-2">
				<div className="flex items-center justify-start">
					{renderAddTodoButton(s.id, idx)}
				</div>
			</div>
 		);
		return (
			<div className="border-t border-neutral-200 pl-6 pr-2 py-2">
				<ul className="space-y-1">
					{s.todos.map((t) => (
						<li key={t.id}>
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2 min-w-0">
									<StatusDot completed={!!t.done} variant="todo" onClick={() => { toggleTodo(idx, t.id)(); setDirty(true); }} />
									<span className="text-[12px] text-neutral-800 truncate">{t.title}</span>
								</div>
								<div className="shrink-0">
									<div className="flex items-center">
										<input type="number" min={0} step={0.5} value={t.estimateHours ?? ''} onChange={(e) => { updateTodoEstimate(idx, t.id, e.target.value); setDirty(true); }} className="w-12 focus:w-16 transition-all border border-neutral-300 rounded px-1.5 py-[2px] text-[11px] text-right" />
										<span className="ml-1 text-[11px] text-neutral-500">h</span>
									</div>
								</div>
							</div>
						</li>
					))}
				</ul>
				<div className="pt-2 flex items-center justify-start">
					{renderAddTodoButton(s.id, idx)}
				</div>
			</div>
		);
	}

	function renderAddTodoButton(subId: number, subIdx: number) {
		const isAdding = !!addingTodo[subId];
		if (!isAdding) {
			return (
				<button onClick={() => setAddingTodo((p) => ({ ...p, [subId]: true }))} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700">
					<span className="[&_svg]:w-3.5 [&_svg]:h-3.5"><IconPlus /></span>
					<span>Todo</span>
				</button>
			);
		}
		return (
			<div className="flex items-center gap-2">
				<input value={newTodoTitle[subId] || ''} onChange={(e) => { setNewTodoTitle((p) => ({ ...p, [subId]: e.target.value })); setDirty(true); }} placeholder="Todo title" className="flex-1 min-w-0 border border-neutral-300 rounded px-2 py-1 text-[12px]" />
				<div className="flex items-center">
					<input type="number" min={0} step={0.5} value={newTodoEstimate[subId] || ''} onChange={(e) => { setNewTodoEstimate((p) => ({ ...p, [subId]: e.target.value })); setDirty(true); }} className="w-12 focus:w-16 transition-all border border-neutral-300 rounded px-1.5 py-[2px] text-[11px] text-right" />
					<span className="ml-1 text-[11px] text-neutral-500">h</span>
				</div>
				<button onClick={() => { setAddingTodo((p) => ({ ...p, [subId]: false })); setNewTodoTitle((p) => ({ ...p, [subId]: '' })); setNewTodoEstimate((p) => ({ ...p, [subId]: '' })); }} className="px-2 py-1 text-[12px] rounded border border-neutral-300 text-neutral-700">Cancel</button>
				<button onClick={() => addTodo(subIdx, subId)} className="px-2 py-1 text-[12px] rounded bg-[#00b393] text-white">Add</button>
			</div>
		);
	}

	function toggleSub(idx: number) {
		return () => setSubs((prev) => prev.map((s, i) => (i === idx ? { ...s, done: !s.done } : s)));
	}
	function toggleTodo(subIdx: number, todoId: number) {
		return () =>
			setSubs((prev) =>
				prev.map((s, i) =>
					i === subIdx ? { ...s, todos: (s.todos || []).map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)) } : s
				)
			);
	}
	function updateTodoEstimate(idx: number, todoId: number, value: string) {
		setSubs((prev) =>
			prev.map((s, i) =>
				i === idx
					? {
							...s,
							todos: (s.todos || []).map((t) => (t.id === todoId ? { ...t, estimateHours: value === '' ? undefined : Number(value) } : t)),
					  }
					: s
			)
		);
	}

	function createSub() {
		const title = newSubTitle.trim();
		if (!title) return;
		const newId = Date.now();
		setSubs((prev) => [
			...prev,
			{
				id: newId,
				title,
				user: parent.user,
				due: newSubDue || undefined,
				done: false,
				description: '',
				estimateHours: newSubEstimate ? Number(newSubEstimate) : undefined,
				todos: [],
			},
		]);
		setOpenTodos((p) => ({ ...p, [newId]: true }));
		setAddingSub(false);
		setNewSubTitle('');
		setNewSubDue('');
		setNewSubEstimate('');
		setDirty(true);
	}

	function addTodo(subIdx: number, subId: number) {
		const title = (newTodoTitle[subId] || '').trim();
		if (!title) return;
		const id = Date.now();
		const estStr = newTodoEstimate[subId] || '';
		setSubs((prev) =>
			prev.map((s, i) =>
				i === subIdx
					? { ...s, todos: [...(s.todos || []), { id, title, estimateHours: estStr ? Number(estStr) : undefined, done: false }] }
					: s
			)
		);
		setAddingTodo((p) => ({ ...p, [subId]: false }));
		setNewTodoTitle((p) => ({ ...p, [subId]: '' }));
		setNewTodoEstimate((p) => ({ ...p, [subId]: '' }));
		setDirty(true);
	}
}

function calcProgress(children: SubTask[]): number {
	if (!children || children.length === 0) return 0;
	const completed = children.filter((c) => c.done).length;
	return Math.round((completed / children.length) * 100);
}

type SubTaskWithLocal = SubTask & { todos?: SubTodo[] }; 