'use client';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import IconFolderUpload from '../../atoms/icons/FolderUpload';
import ImageIcon from '../../atoms/icons/Image';
import IconPlus from '../../atoms/icons/Plus';
import TodoMemoEditor, { TodoMemoEditorRef } from '../TodoMemoEditor';
import TodoMemoViewer from '../TodoMemoViewer';

// HTMLからファイルURL（Supabaseストレージのパブリック URL）を抽出する関数
function extractFileUrlsFromHtml(html: string): string[] {
	if (!html) return [];

	const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/g) || [];
	const urls: string[] = [];

	imgMatches.forEach(imgTag => {
		const srcMatch = imgTag.match(/src="([^"]*)"/);
		if (srcMatch && srcMatch[1]) {
			const url = srcMatch[1];
			// Supabaseストレージの公開URLのみ抽出（データURLなどは除外）
			if (url.includes('supabase.co/storage/v1/object/public/')) {
				urls.push(url);
			}
		}
	});

	return urls;
}

interface MemoRowItem {
	id: string;
	todo_id: string;
	content_text: string;
	content_html: string;
	created_at?: string;
	updated_at?: string;
}

interface TodoMemoSectionProps {
	todoId: string;
	isExpanded: boolean;
	isEditing: boolean;
	editingMemoTarget?: string | null;
	todoMemos?: { content: string; html: string; images: File[] };
	memoList: MemoRowItem[];
	onMemoContentChange?: (todoId: string, content: string) => void;
	onMemoHtmlChange?: (todoId: string, html: string) => void;
	onImagePaste?: (todoId: string, file: File) => void;
	onImageDelete?: (todoId: string, imageIndex: number) => void;
	onSaveMemo?: (todoId: string) => void;
	onCancelMemoEdit?: (todoId: string) => void;
	onServerDeleteMemo?: (memoId: string, todoId: string) => void;
	onBeginEditExistingMemo?: (todoId: string, memo: MemoRowItem) => void;
}

export default function TodoMemoSection({
	todoId,
	isExpanded,
	isEditing,
	editingMemoTarget,
	todoMemos,
	memoList,
	onMemoContentChange,
	onMemoHtmlChange,
	onImagePaste,
	onImageDelete,
	onSaveMemo,
	onCancelMemoEdit,
	onServerDeleteMemo,
	onBeginEditExistingMemo,
}: TodoMemoSectionProps): React.ReactElement | null {
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [showNewMemoAttachMenu, setShowNewMemoAttachMenu] = useState<boolean>(false);
	const [showEditMemoAttachMenu, setShowEditMemoAttachMenu] = useState<string | null>(null);
	const newMemoEditorRef = useRef<TodoMemoEditorRef>(null);
	const editMemoEditorRef = useRef<TodoMemoEditorRef>(null);

	// Hooks の順序を安定させるため、早期 return より前に配置
	useEffect(() => {
		const handleClickOutside = (_event: MouseEvent) => {
			if (showNewMemoAttachMenu || showEditMemoAttachMenu) {
				setShowNewMemoAttachMenu(false);
				setShowEditMemoAttachMenu(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showNewMemoAttachMenu, showEditMemoAttachMenu]);

	if (!isExpanded || !todoMemos) {
		return null;
	}

	const handleSaveMemo = async (): Promise<void> => {
		if (isSaving) return; // 保存中は処理しない

		try {
			setIsSaving(true);
			const fd = new FormData();
			fd.append('todo_id', todoId);
			fd.append('content_text', todoMemos.content || '');
			fd.append('content_html', todoMemos.html || '');
			(todoMemos.images || []).forEach((f: File) => fd.append('files', f));
			const res = await fetch('/api/todo-memos/save', { method: 'POST', body: fd });
			if (!res.ok) throw new Error('Failed to save memo');
			onSaveMemo?.(todoId);
		} catch {
			alert('メモの保存に失敗しました');
		} finally {
			setIsSaving(false);
		}
	};

	// 画像ファイルのみをエディター内に挿入するハンドラー
	const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files;
		if (!files) return;

		console.log('画像選択:', files.length, 'files');

		const fileArray = Array.from(files) as File[];
		fileArray.forEach((file: File) => {
			console.log('画像ファイル:', {
				name: file.name,
				type: file.type,
				size: file.size
			});

			// 画像ファイルのみを処理
			if (file.type.startsWith('image/')) {
				console.log('画像ファイルをエディター内に直接挿入:', file.name);
				if (editingMemoTarget) {
					// 編集中の場合
					console.log('編集中のメモに画像を挿入');
					if (editMemoEditorRef.current) {
						editMemoEditorRef.current.insertFile(file);
					} else {
						console.error('editMemoEditorRefが設定されていません');
					}
				} else {
					// 新規作成中の場合
					console.log('新規メモに画像を挿入');
					if (newMemoEditorRef.current) {
						newMemoEditorRef.current.insertFile(file);
					} else {
						console.error('newMemoEditorRefが設定されていません');
					}
				}
			} else {
				console.warn('画像以外のファイルが選択されました:', file.name, file.type);
			}
		});
		e.currentTarget.value = '';
		setShowNewMemoAttachMenu(false);
		setShowEditMemoAttachMenu(null);
	};

	// 画像以外のファイルのみをファイルリストに追加するハンドラー
	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files;
		if (!files) return;

		console.log('ファイル選択:', files.length, 'files');

		const fileArray = Array.from(files) as File[];
		fileArray.forEach((file: File) => {
			console.log('ファイル:', {
				name: file.name,
				type: file.type,
				size: file.size
			});

			// 画像以外のファイルのみを処理
			if (!file.type.startsWith('image/')) {
				console.log('非画像ファイルを添付:', file.name);
				onImagePaste?.(todoId, file);
			} else {
				console.warn('画像ファイルが選択されました。画像挿入ボタンを使用してください:', file.name);
			}
		});
		e.currentTarget.value = '';
		setShowNewMemoAttachMenu(false);
		setShowEditMemoAttachMenu(null);
	};

	// ポップアップメニューコンポーネント
	const AttachmentMenu = ({
		isVisible,
		onClose,
		imageInputId,
		fileInputId
	}: {
		isVisible: boolean;
		onClose: () => void;
		imageInputId: string;
		fileInputId: string;
	}) => {
		if (!isVisible) return null;

		return (
			<div
				className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px]"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-md"
					onClick={() => {
						document.getElementById(imageInputId)?.click();
						onClose();
					}}
				>
					<ImageIcon className="w-4 h-4" />
					画像を挿入
				</button>
				<button
					type="button"
					className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 last:rounded-b-md border-t border-gray-100"
					onClick={() => {
						document.getElementById(fileInputId)?.click();
						onClose();
					}}
				>
					<IconFolderUpload className="w-4 h-4" />
					ファイルを添付
				</button>
			</div>
		);
	};

	return (
		<div className="ml-4">
			<div className="space-y-2">
				{/* 新規メモを編集中の場合：一覧の先頭にエディタを表示 */}
				{isEditing && !editingMemoTarget && (
					<div className="space-y-2">
						<div className="bg-gray-100 rounded-md border border-gray-200 p-1 min-h-[120px] relative">
							<TodoMemoEditor
								ref={newMemoEditorRef}
								todoId={todoId}
								html={todoMemos.html || ''}
								onContentChange={(id, content) => onMemoContentChange?.(id, content)}
								onHtmlChange={(id, html) => onMemoHtmlChange?.(id, html)}
								onImagePaste={onImagePaste}
							/>
						</div>

						{/* 添付ファイル表示エリア */}
						{todoMemos.images && todoMemos.images.length > 0 && (
							<div className="px-2 py-1">
								<div className="flex flex-wrap gap-3">
									{todoMemos.images.map((file: File, index: number) => {
										// 既存ファイルかどうかをチェック
										const isExistingFile = Boolean((file as unknown as { existingUrl?: string }).existingUrl);
										const imageSrc = isExistingFile ? (file as unknown as { existingUrl: string }).existingUrl : URL.createObjectURL(file);
										const fileName = file.name || 'file';

										return (
											<div key={index} className="relative group">
												{file.type.startsWith('image/') ? (
													<div className="text-center">
														<div className="relative">
															<img
																src={imageSrc}
																alt={fileName}
																className="w-20 h-16 object-cover rounded border border-gray-200 cursor-pointer"
																onClick={() => {
																	const modal = document.createElement('div');
																	modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
																	modal.onclick = () => modal.remove();
																	const img = document.createElement('img');
																	img.src = imageSrc;
																	img.className = 'max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg';
																	img.alt = fileName;
																	modal.appendChild(img);
																	document.body.appendChild(modal);
																}}
															/>
															<button
																onClick={() => onImageDelete?.(todoId, index)}
																className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
															>
																×
															</button>
														</div>
														<div className="text-xs text-gray-600 mt-1 max-w-20 truncate">
															{fileName}
														</div>
													</div>
												) : (
													<div className="text-center">
														<div className="relative w-20 h-16 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center text-xs text-gray-600 cursor-pointer"
															onClick={() => {
																if (isExistingFile) {
																	window.open((file as unknown as { existingUrl: string }).existingUrl, '_blank');
																}
															}}
														>
															{file.type === 'application/pdf' ? (
																<>
																	<div className="text-red-500 font-bold">PDF</div>
																	<div className="text-xs">ファイル</div>
																</>
															) : (
																<>
																	<div className="font-medium">{fileName.split('.').pop()?.toUpperCase()}</div>
																	<div className="text-xs">
																		{isExistingFile ? 'ファイル' : `${(file.size / 1024).toFixed(0)}KB`}
																	</div>
																</>
															)}
															<button
																onClick={(ev) => {
																	ev.stopPropagation();
																	onImageDelete?.(todoId, index);
																}}
																className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
															>
																×
															</button>
														</div>
														<div className="text-xs text-gray-600 mt-1 max-w-20 truncate">
															{fileName}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* 画像挿入用のinput */}
						<input
							type="file"
							accept="image/*"
							multiple
							id={`image-input-memo-${todoId}`}
							className="hidden"
							onChange={handleImageSelect}
						/>
						{/* ファイル添付用のinput */}
						<input
							type="file"
							accept=".pdf,.doc,.docx,.txt,.zip,.rar"
							multiple
							id={`file-input-memo-${todoId}`}
							className="hidden"
							onChange={handleFileSelect}
						/>
						<div className="flex items-center justify-between px-2 pt-1">
							<div className="flex items-center gap-2">
								{/* 添付ボタン（+ボタン） */}
								<div className="relative">
									<button
										type="button"
										className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
										onClick={() => setShowNewMemoAttachMenu(!showNewMemoAttachMenu)}
										title="添付"
									>
										<IconPlus className="w-4 h-4" />
									</button>
									<AttachmentMenu
										isVisible={showNewMemoAttachMenu}
										onClose={() => setShowNewMemoAttachMenu(false)}
										imageInputId={`image-input-memo-${todoId}`}
										fileInputId={`file-input-memo-${todoId}`}
									/>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={handleSaveMemo}
									disabled={isSaving}
									className={`text-xs px-2 py-1 rounded border border-neutral-300 transition-colors ${
										isSaving
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white'
									}`}
								>
									{isSaving ? '保存中...' : '保存'}
								</button>
								<button
									onClick={() => onCancelMemoEdit?.(todoId)}
									disabled={isSaving}
									className={`text-xs px-2 py-1 rounded border border-neutral-300 transition-colors ${
										isSaving
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 bg-white'
									}`}
								>
									キャンセル
								</button>
							</div>
						</div>
					</div>
				)}

				{/* 既存メモ一覧 */}
				{memoList.map((memo, index) => (
					<div key={memo.id}>
						<div className="px-2 py-0.5">
							<div className="flex items-center gap-2 mb-1">
								{editingMemoTarget !== memo.id && (
									<>
										<span className="text-xs text-gray-500">
											{new Date(memo.created_at ?? memo.updated_at ?? Date.now()).toLocaleString('ja-JP', {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
										<button
											onClick={() => onBeginEditExistingMemo?.(todoId, memo)}
											className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
										>
											編集
										</button>
										<button
											onClick={() => {
												if (confirm('このメモを削除しますか？')) {
													onServerDeleteMemo?.(memo.id, todoId);
												}
											}}
											className="text-xs text-red-600 hover:text-red-700 hover:underline"
										>
											削除
										</button>
									</>
								)}
							</div>

							{/* メモ内容表示/編集 */}
							{editingMemoTarget === memo.id ? (
								<div className="space-y-2">
									<div className="bg-gray-100 rounded-md border border-gray-200 p-1 min-h-[120px] relative">
										<TodoMemoEditor
											ref={editMemoEditorRef}
											todoId={todoId}
											html={memo.content_html || ''}
											onContentChange={(id, content) => onMemoContentChange?.(id, content)}
											onHtmlChange={(id, html) => onMemoHtmlChange?.(id, html)}
											onImagePaste={onImagePaste}
										/>
									</div>

									{/* 添付ファイル表示エリア */}
									{todoMemos.images && todoMemos.images.length > 0 && (
										<div className="px-2 py-1">
											<div className="flex flex-wrap gap-3">
												{todoMemos.images.map((file: File, index: number) => {
													// 既存ファイルかどうかをチェック
													const isExistingFile = Boolean((file as unknown as { existingUrl?: string }).existingUrl);
													const imageSrc = isExistingFile ? (file as unknown as { existingUrl: string }).existingUrl : URL.createObjectURL(file);
													const fileName = file.name || 'file';

													return (
														<div key={index} className="relative group">
															{file.type.startsWith('image/') ? (
																<div className="text-center">
																	<div className="relative">
																		<img
																			src={imageSrc}
																			alt={fileName}
																			className="w-20 h-16 object-cover rounded border border-gray-200 cursor-pointer"
																			onClick={() => {
																				const modal = document.createElement('div');
																				modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
																				modal.onclick = () => modal.remove();
																				const img = document.createElement('img');
																				img.src = imageSrc;
																				img.className = 'max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg';
																				img.alt = fileName;
																				modal.appendChild(img);
																				document.body.appendChild(modal);
																			}}
																		/>
																		<button
																			onClick={() => onImageDelete?.(todoId, index)}
																			className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
																		>
																			×
																		</button>
																	</div>
																	<div className="text-xs text-gray-600 mt-1 max-w-20 truncate">
																		{fileName}
																	</div>
																</div>
															) : (
																<div className="text-center">
																	<div className="relative w-20 h-16 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center text-xs text-gray-600 cursor-pointer"
																		onClick={() => {
																			if (isExistingFile) {
																				window.open((file as unknown as { existingUrl: string }).existingUrl, '_blank');
																			}
																		}}
																	>
																		{file.type === 'application/pdf' ? (
																			<>
																				<div className="text-red-500 font-bold">PDF</div>
																				<div className="text-xs">ファイル</div>
																			</>
																		) : (
																			<>
																				<div className="font-medium">{fileName.split('.').pop()?.toUpperCase()}</div>
																				<div className="text-xs">
																					{isExistingFile ? 'ファイル' : `${(file.size / 1024).toFixed(0)}KB`}
																				</div>
																			</>
																		)}
																		<button
																			onClick={(ev) => {
																				ev.stopPropagation();
																				onImageDelete?.(todoId, index);
																			}}
																			className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
																		>
																			×
																		</button>
																	</div>
																	<div className="text-xs text-gray-600 mt-1 max-w-20 truncate">
																		{fileName}
																	</div>
																</div>
															)}
														</div>
													);
												})}
											</div>
										</div>
									)}

									{/* 画像挿入用のinput */}
									<input
										type="file"
										accept="image/*"
										multiple
										id={`image-input-edit-memo-${memo.id}`}
										className="hidden"
										onChange={handleImageSelect}
									/>
									{/* ファイル添付用のinput */}
									<input
										type="file"
										accept=".pdf,.doc,.docx,.txt,.zip,.rar"
										multiple
										id={`file-input-edit-memo-${memo.id}`}
										className="hidden"
										onChange={handleFileSelect}
									/>
									<div className="flex items-center justify-between px-2 pt-1">
										<div className="flex items-center gap-2">
											{/* 添付ボタン（+ボタン） */}
											<div className="relative">
												<button
													type="button"
													className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
													onClick={() => setShowEditMemoAttachMenu(showEditMemoAttachMenu === memo.id ? null : memo.id)}
													title="添付"
												>
													<IconPlus className="w-4 h-4" />
												</button>
												<AttachmentMenu
													isVisible={showEditMemoAttachMenu === memo.id}
													onClose={() => setShowEditMemoAttachMenu(null)}
													imageInputId={`image-input-edit-memo-${memo.id}`}
													fileInputId={`file-input-edit-memo-${memo.id}`}
												/>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={handleSaveMemo}
												disabled={isSaving}
												className={`text-xs px-2 py-1 rounded border border-neutral-300 transition-colors ${
													isSaving
														? 'bg-gray-100 text-gray-400 cursor-not-allowed'
														: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white'
												}`}
											>
												{isSaving ? '保存中...' : '保存'}
											</button>
											<button
												onClick={() => onCancelMemoEdit?.(todoId)}
												disabled={isSaving}
												className={`text-xs px-2 py-1 rounded border border-neutral-300 transition-colors ${
													isSaving
														? 'bg-gray-100 text-gray-400 cursor-not-allowed'
														: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 bg-white'
												}`}
											>
												キャンセル
											</button>
										</div>
									</div>
								</div>
							) : (
								<TodoMemoViewer todoId={todoId} html={memo.content_html || ''} images={extractFileUrlsFromHtml(memo.content_html || '')} />
							)}
						</div>

						{/* 区切り線 */}
						{index < memoList.length - 1 && (
							<div className="border-t border-gray-200 mt-3" />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
