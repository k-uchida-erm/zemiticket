'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState } from 'react';
import { ParentTask, SubTask, SubTodo } from '../../../types';
import StatusDot from '../../atoms/StatusDot';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import IconPlus from '../../atoms/icons/Plus';
import SortableTodosContainer from '../SortableTodosContainer';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface SortableSubTaskProps {
	subtask: SubTask & { todos?: SubTodo[] };
	_parent: ParentTask;
	openTodos: Record<string, boolean>;
	onToggleTodos: (subtaskId: string) => void;
	onToggleTodo: (subtaskId: string, todoId: string) => void;
	onEditSub: (subtaskId: string) => void;
	onSaveSub: (subtaskId: string) => void;
	onCancelSub: (subtaskId: string) => void;
	onDeleteTodo: (subtaskId: string, todoId: string) => void;
	onReorderTodos: (subtaskId: string, newOrder: SubTodo[]) => void;
	editingSub: Record<string, boolean>;
	editingSubTitle: Record<string, string>;
	editingTodoTitles: Record<string, Record<string, string>>;
	editingTodoEstimates: Record<string, Record<string, string>>;
	onSubTitleChange: (subtaskId: string, title: string) => void;
	onTodoTitleChange: (subtaskId: string, todoId: string, title: string) => void;
	onTodoEstimateChange: (
		subtaskId: string,
		todoId: string,
		estimate: string
	) => void;
	onAddTodo: (subtaskId: string) => void;
	onSaveNewTodo: (subtaskId: string) => void;
	onCancelNewTodo: (subtaskId: string) => void;
	addingTodo: Record<string, boolean>;
	newTodoTitle: Record<string, string>;
	newTodoEstimate: Record<string, string>;
	onNewTodoTitleChange: (subtaskId: string, title: string) => void;
	onNewTodoEstimateChange: (subtaskId: string, estimate: string) => void;
	// コメント関連のprops
	subtaskComments?: Record<string, Comment[]>;
	onAddSubtaskComment?: (subtaskId: string, text: string) => void;
	onDeleteSubtaskComment?: (subtaskId: string, commentId: string) => void;
	todoComments?: Record<string, Comment[]>;
	onAddTodoComment?: (subtaskId: string, todoId: string, text: string) => void;
	onDeleteTodoComment?: (
		subtaskId: string,
		todoId: string,
		commentId: string
	) => void;
}

interface TodoMemoState {
	content: string;
	html: string;
	images: File[];
}

interface MemoRow {
	id: string;
	todo_id: string;
	content_text: string;
	content_html: string;
	created_at?: string;
	updated_at?: string;
}

export default function SortableSubTask({
	subtask,
	_parent,
	openTodos,
	onToggleTodos,
	onToggleTodo,
	onEditSub,
	onSaveSub,
	onCancelSub,
	onAddTodo,
	onSaveNewTodo,
	onCancelNewTodo,
	onNewTodoTitleChange,
	onNewTodoEstimateChange,
	onTodoTitleChange,
	onTodoEstimateChange,
	onDeleteTodo,
	onReorderTodos,
	onSubTitleChange,
	editingSub,
	editingSubTitle,
	editingTodoTitles,
	editingTodoEstimates,
	addingTodo,
	newTodoTitle,
	newTodoEstimate,
}: SortableSubTaskProps) {
	const [attachedFiles, setAttachedFiles] = useState<Record<string, File[]>>({});

	// 新しい設計のための状態
	const [todoMemos, setTodoMemos] = useState<Record<string, TodoMemoState>>({});
	const [_todoFiles, _setTodoFiles] = useState<Record<string, File[]>>({});
	const [showAddOptions, setShowAddOptions] = useState<Record<string, boolean>>({});
	const [expandedMemos, setExpandedMemos] = useState<Record<string, boolean>>({});
	const [editingMemos, setEditingMemos] = useState<Record<string, boolean>>({});
	const [memoLists, setMemoLists] = useState<Record<string, MemoRow[]>>({});
	const [editingMemoTarget, setEditingMemoTarget] = useState<Record<string, string | null>>({});

	// ポップアップ外クリックで閉じる機能
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!target.closest('.add-options-popup')) {
				setShowAddOptions({});
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setShowAddOptions({});
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, []);

	// 新しい機能のハンドラー関数
	const handleAddMemo = (todoId: string) => {
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: { content: '', html: '', images: [] }
		}));
		setExpandedMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
		setShowAddOptions((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
	};

	const handleAddFile = (todoId: string) => {
		document.getElementById(`file-input-todo-${todoId}`)?.click();
		setShowAddOptions((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
	};

	// サブチケ用のメモ追加処理
	const handleAddSubtaskMemo = (subtaskId: string) => {
		setShowAddOptions((prev: Record<string, boolean>) => ({ ...prev, [subtaskId]: false }));
	};

	const handleMemoContentChange = (todoId: string, content: string) => {
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: { ...prev[todoId], content }
		}));
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
	};

	const handleMemoHtmlChange = (todoId: string, html: string) => {
		console.log('handleMemoHtmlChange 呼び出し:', { todoId, htmlLength: html.length, htmlPreview: html.substring(0, 100) + '...' });
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: { ...prev[todoId], html }
		}));
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
		console.log('HTML更新完了');
	};

	// Tiptapエディター用の画像貼り付け処理
	const handleImagePaste = (todoId: string, file: File) => {
		console.log('handleImagePaste 呼び出し:', { todoId, fileName: file.name, fileType: file.type });

		// ファイルをstateに追加（保存用）- 画像・非画像問わず全て保存
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: {
				...prev[todoId],
				images: [...(prev[todoId]?.images || []), file]
			}
		}));

		// 画像ファイルの場合のみ、エディターに直接挿入
		if (file.type.startsWith('image/')) {
			console.log('画像ファイルをエディターに挿入中...');

			// data URLを生成してHTMLに挿入
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result === 'string') {
					console.log('data URL生成完了:', result.substring(0, 50) + '...');

					// 現在のHTMLを取得
					const currentMemo = todoMemos[todoId];
					const currentHtml = currentMemo?.html || '';

					// 画像タグを作成（Tiptapと互換性のあるスタイル、デフォルト幅400px）
					const imageTag = `<img src="${result}" alt="${file.name}" width="400" data-width="400" style="height: auto; max-width: 100%;" />`;

					// HTMLに画像を追加
					const newHtml = currentHtml ? `${currentHtml}<br/>${imageTag}` : imageTag;

					console.log('HTML更新:', { currentLength: currentHtml.length, newLength: newHtml.length });

					// HTMLを更新（これによりRichTextEditorが更新される）
					handleMemoHtmlChange(todoId, newHtml);
				}
			};
			reader.onerror = () => {
				console.error('FileReader エラー');
			};
			reader.readAsDataURL(file);
		} else {
			console.log('非画像ファイル:', file.name, '- エディターには挿入せず、保存のみ');
		}
	};

	const handleImageDelete = (todoId: string, imageIndex: number) => {
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: {
				...prev[todoId],
				images: (prev[todoId]?.images || []).filter((_, index) => index !== imageIndex)
			}
		}));
	};

	const toggleMemoExpanded = async (todoId: string) => {
		const isCurrentlyExpanded = expandedMemos[todoId];
		setExpandedMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: !prev[todoId] }));

		// メモを展開する際に初回のみ詳細データを取得（遅延読み込み）
		if (!isCurrentlyExpanded && !memoLists[todoId]) {
			try {
				await Promise.all([
					fetchMemoForTodo(todoId),
					fetchMemoListForTodo(todoId)
				]);
			} catch {
				// エラーハンドリング
			}
		}
	};

	const toggleMemoEditing = (todoId: string) => {
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: !prev[todoId] }));
	};

	const toggleAddOptions = (todoId: string) => {
		setShowAddOptions((prev: Record<string, boolean>) => ({ ...prev, [todoId]: !prev[todoId] }));
	};

	const cancelMemoEdit = (todoId: string) => {
		// 既存メモ編集中だったかを先に確認
		const wasEditingExisting = editingMemoTarget[todoId] !== null && editingMemoTarget[todoId] !== undefined;

		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
		setEditingMemoTarget((prev: Record<string, string | null>) => ({ ...prev, [todoId]: null }));

		if (!wasEditingExisting) {
			// 新規作成キャンセル時のみデータ削除
			setTodoMemos((prev: Record<string, TodoMemoState>) => {
				const newMemos = { ...prev };
				delete newMemos[todoId];
				return newMemos;
			});
		}
		// 既存メモ編集のキャンセル時は、編集前の状態を保持
	};

	// DBからメモを取得して状態に反映（バッチ処理版）
	const fetchMemosForAllTodos = async (todoIds: string[]): Promise<void> => {
		if (todoIds.length === 0) return;

		try {
			const res = await fetch('/api/todo-memos/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ todoIds })
			});

			if (!res.ok) return;

			const json: { data: { latest: Record<string, MemoRow | null>; lists: Record<string, MemoRow[]> } } = await res.json();
			const { latest, lists } = json.data || { latest: {}, lists: {} };

			// 最新メモを状態に反映
			const newTodoMemos: Record<string, TodoMemoState> = {};
			todoIds.forEach(todoId => {
				const latestMemo = latest[todoId];
				if (latestMemo) {
					newTodoMemos[todoId] = {
						content: latestMemo.content_text ?? '',
						html: latestMemo.content_html ?? '',
						images: [],
					};
				}
			});

			setTodoMemos(prev => ({ ...prev, ...newTodoMemos }));

			// メモリストを状態に反映
			setMemoLists(prev => ({ ...prev, ...lists }));

			// 初期状態設定
			const initialExpandedState: Record<string, boolean> = {};
			const initialEditingState: Record<string, boolean> = {};
			todoIds.forEach(todoId => {
				initialExpandedState[todoId] = false;
				initialEditingState[todoId] = false;
			});

			setExpandedMemos(prev => ({ ...prev, ...initialExpandedState }));
			setEditingMemos(prev => ({ ...prev, ...initialEditingState }));
		} catch {
			// noop
		}
	};

	// 個別メモ取得（既存）- 保存後の再取得用
	const fetchMemoForTodo = async (todoId: string): Promise<void> => {
		try {
			const res = await fetch(`/api/todo-memos/${todoId}`);
			if (!res.ok) return;
			const json: { data: { content_text: string; content_html: string } } = await res.json();

			// HTMLからファイルURLを抽出して既存ファイルとして保持

			// 既存のファイルは不要（HTMLに含まれているため）
			setTodoMemos((prev: Record<string, TodoMemoState>) => ({
				...prev,
				[todoId]: {
					content: json?.data?.content_text ?? '',
					html: json?.data?.content_html ?? '',
					images: [], // ファイルリストは空にして、HTMLの画像のみ表示
				},
			}));
			// 保存後はトグルを開いたままにする（expandedMemosは変更しない）
			setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
		} catch {
			// noop
		}
	};

	const fetchMemoListForTodo = async (todoId: string): Promise<void> => {
		try {
			const res = await fetch(`/api/todo-memos/${todoId}/list`);
			if (!res.ok) return;
			const json: { data: MemoRow[] } = await res.json();
			setMemoLists((prev: Record<string, MemoRow[]>) => ({ ...prev, [todoId]: json.data || [] }));
		} catch {
			// noop
		}
	};

	const beginEditExistingMemo = (todoId: string, memo: MemoRow): void => {
		// 編集時は画像をエディター内のHTMLのみで表示し、ファイルリストには追加しない
		setTodoMemos((prev: Record<string, TodoMemoState>) => ({
			...prev,
			[todoId]: {
				content: memo.content_text ?? '',
				html: memo.content_html ?? '',
				images: [] // 既存の画像はHTMLに含まれているため、ファイルリストは空にする
			},
		}));
		setExpandedMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: true }));
		setEditingMemoTarget((prev: Record<string, string | null>) => ({ ...prev, [todoId]: memo.id }));
	};

	// 初期ロード時は基本情報のみ取得（遅延読み込みで高速化）
	useEffect(() => {
		const todoIds = (subtask.todos ?? [])
			.filter((t: SubTodo) => t.id)
			.map((t: SubTodo) => t.id);

		if (todoIds.length > 0) {
			// 最小限の情報のみ取得（メモカウント用）
			void fetchMemosForAllTodos(todoIds);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subtask.todos]);

	// 保存成功後に最新のメモを再取得（blob置換後のHTML反映のため）
	const saveMemoAndRefresh = async (todoId: string): Promise<void> => {
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
		// 既存メモの上書き扱い: 新規INSERT後に旧IDがあれば削除
		const replaceId: string | null | undefined = editingMemoTarget[todoId];
		if (replaceId) {
			await handleServerDeleteMemo(replaceId, todoId);
			setEditingMemoTarget((prev: Record<string, string | null>) => ({ ...prev, [todoId]: null }));
		}
		await fetchMemoForTodo(todoId);
		await fetchMemoListForTodo(todoId);
	};

	const handleServerDeleteMemo = async (memoId: string, todoId: string): Promise<void> => {
		try {
			console.log('削除開始:', { memoId, todoId });
			const res = await fetch(`/api/todo-memos/delete/${memoId}`, { method: 'DELETE' });
			console.log('削除API応答:', { status: res.status, ok: res.ok });

			if (!res.ok) {
				const errorText = await res.text();
				console.error('削除API失敗:', errorText);
				alert(`メモの削除に失敗しました: ${errorText}`);
				return;
			}

			console.log('削除成功、メモリスト更新中...');
			await fetchMemoListForTodo(todoId);
			console.log('メモリスト更新完了');
		} catch (e) {
			console.error('削除処理エラー:', e);
			alert('メモの削除に失敗しました');
		}
	};

	const deleteMemo = (todoId: string) => {
		setTodoMemos((prev: Record<string, TodoMemoState>) => {
			const newMemos: Record<string, TodoMemoState> = { ...prev };
			delete newMemos[todoId];
			return newMemos;
		});
		setExpandedMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
		setEditingMemos((prev: Record<string, boolean>) => ({ ...prev, [todoId]: false }));
	};

	// 初期化された状態
	const [isOpen, setIsOpen] = useState(openTodos[subtask.id] || false);
	const [isEditing, setIsEditing] = useState(editingSub[subtask.id] || false);
	const [isAddingTodo, setIsAddingTodo] = useState(addingTodo[subtask.id] || false);

	// TODOをsort_order順にソート
	const todos = useMemo(() => {
		if (subtask.todos && Array.isArray(subtask.todos)) {
			return [...subtask.todos].sort((a, b) => {
				const orderA = a.sort_order || 0;
				const orderB = b.sort_order || 0;
				return orderA - orderB;
			});
		}
		return [];
	}, [subtask.todos]);

	// トグル機能を修正
	const handleToggle = () => {
		const newOpenState = !isOpen;
		setIsOpen(newOpenState);
		// 親コンポーネントにも通知
		onToggleTodos(subtask.id);
	};

	// openTodosの変更を監視して同期
	useEffect(() => {
		setIsOpen(openTodos[subtask.id] || false);
	}, [openTodos, subtask.id]);

	// editingSubとaddingTodoの変更を監視
	useEffect(() => {
		setIsEditing(editingSub[subtask.id] || false);
		setIsAddingTodo(addingTodo[subtask.id] || false);
	}, [editingSub, addingTodo, subtask.id]);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: subtask.id,
	});

	// ファイル選択処理
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const fileArray = Array.from(files);
			setAttachedFiles(prev => ({
				...prev,
				[subtask.id]: [...(prev[subtask.id] || []), ...fileArray]
			}));
		}
	};

	// ファイル削除処理
	const handleFileDelete = (fileName: string) => {
		setAttachedFiles(prev => ({
			...prev,
			[subtask.id]: (prev[subtask.id] || []).filter(file => file.name !== fileName)
		}));
	};

	// ファイルサイズを読みやすい形式に変換
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const allTodosDone = todos.length > 0 && todos.every(todo => todo.done);

	// サブタスクの合計時間を計算（サブタスク内のTODOの時間のみ）
	const calculateSubTaskTotalHours = useMemo(() => {
		let totalHours = 0;
		if (subtask.todos) {
			subtask.todos.forEach(todo => {
				if (todo.estimateHours) {
					totalHours += todo.estimateHours;
				}
			});
		}
		return totalHours;
	}, [subtask.todos]);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative p-3 border border-neutral-200 rounded-lg bg-white ${isDragging ? 'shadow-lg' : ''}`}
		>
			{/* ドラッグハンドル - トグルが閉じている時のみ表示 */}
			{!isOpen && (
				<div
					{...attributes}
					{...listeners}
					className='absolute top-1/2 -translate-y-1/2 left-2 w-6 h-6 bg-neutral-100 rounded cursor-move flex items-center justify-center text-neutral-500 hover:bg-neutral-200'
				>
					⋮⋮
				</div>
			)}

			{/* サブタスクヘッダー - トグルが開いている時は左寄せ */}
			<div
				className={`flex items-start justify-between ${isOpen ? 'ml-0' : 'ml-8'}`}
			>
				<div className='flex items-start gap-2 flex-1 min-w-0'>
					{/* 完了時のみチェックマークを表示 */}
					{allTodosDone && (
						<div className='shrink-0'>
																						<StatusDot
																completed={true}
																_variant='subticket'
																className='cursor-default'
															/>
						</div>
					)}

					{/* タイトル */}
					<div className='min-w-0 flex-1'>
						{isEditing ? (
							<textarea
								value={editingSubTitle[subtask.id] || subtask.title}
								onChange={e => onSubTitleChange(subtask.id, e.target.value)}
								className='w-full px-2 py-1 border border-neutral-300 rounded text-sm resize-none min-h-[2rem] max-h-32'
								autoFocus
								rows={1}
							/>
						) : (
							<h3 className='text-sm font-medium text-neutral-900 leading-6 whitespace-pre-wrap break-words'>
								{subtask.title}
							</h3>
						)}
					</div>

					{/* 時間チップとトグルボタンを左寄せ */}
					<div className='flex items-center gap-2 shrink-0'>
						{/* 時間チップ - 0時間も表示 */}
						<span className='shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white'>
							{calculateSubTaskTotalHours}h
						</span>

						{/* 完了状態トグル */}
						<button
							type='button'
							onClick={handleToggle}
							className='shrink-0 p-1 text-neutral-500 hover:text-neutral-700'
						>
							<IconChevronDown
								className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
							/>
						</button>
					</div>
				</div>

				{/* アクションボタン */}
				<div className='flex items-center gap-2 ml-4'>
					{isEditing ? (
						<>
							<button
								onClick={() => onCancelSub(subtask.id)}
								className='px-3 py-1 bg-white border border-neutral-300 text-neutral-700 text-xs rounded hover:bg-neutral-50'
							>
								キャンセル
							</button>
							<button
								onClick={() => {
									onSaveSub(subtask.id);
								}}
								className='px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]'
							>
								保存
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => {
									onEditSub(subtask.id);
								}}
								className='px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]'
							>
								編集
							</button>
							{/* ファイル選択用のinput（非表示） */}
							<input
								type='file'
								multiple
								onChange={handleFileSelect}
								className='hidden'
								id={`file-input-subtask-${subtask.id}`}
								accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif'
							/>
							{/* ファイル選択ボタン */}
							<div className='relative'>
								<button
									onClick={() => setShowAddOptions(prev => ({ ...prev, [subtask.id]: !prev[subtask.id] }))}
									className='w-6 h-6 inline-flex items-center justify-center rounded-full bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
									title='メモ・ファイル追加'
								>
									<IconPlus className='w-3 h-3' />
								</button>

								{/* 選択肢ポップアップ */}
								{showAddOptions?.[subtask.id] && (
									<div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px] add-options-popup'>
										<div className='p-2 space-y-1'>
											<button
												onClick={() => handleAddSubtaskMemo(subtask.id)}
												className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2'
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												<span>メモを追加</span>
											</button>
											<button
												onClick={() => document.getElementById(`file-input-subtask-${subtask.id}`)?.click()}
												className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2'
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
												<span>ファイルを添付</span>
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>

			{/* TODOリスト */}
			{isOpen && (
				<div className='mt-2 ml-8 space-y-1'>
					{/* 並び替え可能なTODOリスト */}
					{todos.length > 0 && (
						<SortableTodosContainer
							todos={todos}
							subtaskId={subtask.id}
							isEditing={isEditing}
							editingTodoTitles={editingTodoTitles[subtask.id] ?? {}}
							editingTodoEstimates={editingTodoEstimates[subtask.id] ?? {}}
							onToggle={onToggleTodo}
							onTitleChange={onTodoTitleChange}
							onEstimateChange={onTodoEstimateChange}
							onDelete={onDeleteTodo}
							onReorderTodos={onReorderTodos}
							onAddMemo={handleAddMemo}
							onAddFile={handleAddFile}
							showAddOptions={showAddOptions}
							onToggleAddOptions={toggleAddOptions}
							// メモ・ファイル表示のためのprops
							todoMemos={todoMemos}
							expandedMemos={expandedMemos}
							editingMemos={editingMemos}
							onMemoContentChange={handleMemoContentChange}
							onMemoHtmlChange={handleMemoHtmlChange}
							onImagePaste={handleImagePaste}
							onImageDelete={handleImageDelete}
							onToggleMemoExpanded={toggleMemoExpanded}
							onToggleMemoEditing={toggleMemoEditing}
							onSaveMemo={saveMemoAndRefresh}
							onCancelMemoEdit={cancelMemoEdit}
							onDeleteMemo={deleteMemo}
							memoLists={memoLists}
							onServerDeleteMemo={handleServerDeleteMemo}
							onBeginEditExistingMemo={beginEditExistingMemo}
							editingMemoTarget={editingMemoTarget}
						/>
					)}

					{/* 新しいTODO追加 */}
					{isEditing && isAddingTodo ? (
						<div className='flex items-center gap-2 p-2 bg-white rounded'>
							{/* 入力フィールド */}
							<input
								type='text'
								value={newTodoTitle[subtask.id] || ''}
								onChange={e => onNewTodoTitleChange(subtask.id, e.target.value)}
								placeholder='新しいTODO'
								className='flex-1 px-2 py-1 border border-neutral-300 rounded text-xs'
								autoFocus
							/>
							<input
								type='number'
								step='0.5'
								value={newTodoEstimate[subtask.id] || ''}
								onChange={e =>
									onNewTodoEstimateChange(subtask.id, e.target.value)
								}
								placeholder='時間'
								className='w-16 px-2 py-1 border border-neutral-300 rounded text-xs'
							/>

							{/* ボタン */}
							<button
								onClick={() => onCancelNewTodo(subtask.id)}
								className='px-3 py-1 bg-white border border-neutral-300 text-neutral-700 text-xs rounded hover:bg-neutral-50'
							>
								キャンセル
							</button>
							<button
								onClick={() => onSaveNewTodo(subtask.id)}
								className='px-3 py-1 bg-[#00b393] text-white text-xs rounded hover:bg-[#009a7f]'
							>
								追加
							</button>
						</div>
					) : isEditing ? (
						<button
							onClick={() => onAddTodo(subtask.id)}
							className='inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700'
						>
							<IconPlus className='w-3 h-3' />
							<span>新しいTODOを追加</span>
						</button>
					) : null}
				</div>
			)}

			{/* 添付ファイルセクション */}
			{isOpen && attachedFiles[subtask.id] && attachedFiles[subtask.id].length > 0 && (
				<div className='mt-3 ml-8'>
					<div className='text-xs font-medium text-neutral-700 mb-2'>添付ファイル</div>
					<div className='space-y-2'>
						{attachedFiles[subtask.id].map((file, index) => (
							<div key={index} className='flex items-center justify-between p-2 bg-neutral-50 rounded border'>
								<div className='flex items-center gap-2 min-w-0'>
									<div className='w-4 h-4 bg-blue-100 rounded flex items-center justify-center'>
										<span className='text-xs text-blue-600'>F</span>
									</div>
									<div className='min-w-0'>
										<div className='text-xs font-medium text-neutral-800 truncate'>{file.name}</div>
										<div className='text-xs text-neutral-500'>{formatFileSize(file.size)}</div>
									</div>
								</div>
								<button
									onClick={() => handleFileDelete(file.name)}
									className='px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded'
									title='ファイルを削除'
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
