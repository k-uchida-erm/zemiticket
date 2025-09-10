'use client';

import Image from '@tiptap/extension-image';
import type { ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView, NodeView } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface RichTextEditorProps {
	content: string;
	onContentChange: (content: string) => void;
	onHtmlChange?: (html: string) => void;
	todoId: string;
	onImagePaste?: (todoId: string, file: File) => void;
	onFileUpload?: (file: File) => void; // ファイルアップロード用のコールバック
}

// 外部から呼び出せるメソッドの型定義
export interface RichTextEditorRef {
	insertFileIntoEditor: (file: File) => void;
}

// 画像幅設定
const MIN_IMG_WIDTH = 80;
const MAX_IMG_WIDTH = 1200;
const DEFAULT_IMG_WIDTH = 400;

class ResizableImageView implements NodeView {
	public dom: HTMLElement;
	private readonly imgEl: HTMLImageElement;
	private readonly handleEl: HTMLDivElement;
	private readonly getPos: () => number;
	private readonly view: EditorView;
	private dragging: boolean = false;
	private startX: number = 0;
	private startWidth: number = 0;

	constructor(node: ProseMirrorNode, view: EditorView, getPos: boolean | (() => number)) {
		this.view = view;
		this.getPos = (getPos as () => number);

		this.dom = document.createElement('span');
		this.dom.style.display = 'inline-block';
		this.dom.style.position = 'relative';
		this.dom.style.verticalAlign = 'middle';

		this.imgEl = document.createElement('img');
		console.log('ResizableImageView - node.attrs:', node.attrs);
		console.log('ResizableImageView - src属性:', node.attrs.src);
		this.imgEl.src = String(node.attrs.src ?? '');
		this.imgEl.alt = String(node.attrs.alt ?? '');
		this.imgEl.style.height = 'auto';
		this.imgEl.style.maxWidth = '100%';
		this.imgEl.style.display = 'inline-block';
		this.imgEl.style.cursor = 'zoom-in';
		console.log('ResizableImageView - 最終的なimg.src:', this.imgEl.src);
		if (typeof node.attrs.width === 'number') {
			this.imgEl.style.width = `${node.attrs.width}px`;
		}

		this.handleEl = document.createElement('div');
		this.handleEl.style.position = 'absolute';
		this.handleEl.style.right = '0';
		this.handleEl.style.bottom = '0';
		this.handleEl.style.width = '10px';
		this.handleEl.style.height = '10px';
		this.handleEl.style.background = 'rgba(0,0,0,0.35)';
		this.handleEl.style.cursor = 'nwse-resize';
		this.handleEl.style.borderRadius = '2px';

		this.dom.appendChild(this.imgEl);
		this.dom.appendChild(this.handleEl);

		this.handleEl.addEventListener('mousedown', this.onMouseDown);
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);
		this.imgEl.addEventListener('click', this.onImageClick);
	}

	private onImageClick = (): void => {
		const modal = document.createElement('div');
		modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
		modal.onclick = () => modal.remove();
		const img = document.createElement('img');
		img.src = this.imgEl.src;
		img.className = 'max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg';
		img.alt = this.imgEl.alt || 'image';
		modal.appendChild(img);
		document.body.appendChild(modal);
	};

	private onMouseDown = (e: MouseEvent): void => {
		e.preventDefault();
		this.dragging = true;
		this.startX = e.clientX;
		this.startWidth = this.imgEl.getBoundingClientRect().width;
	};

	private onMouseMove = (e: MouseEvent): void => {
		if (!this.dragging) return;
		const delta = e.clientX - this.startX;
		let newWidth = Math.round(this.startWidth + delta);
		if (newWidth < MIN_IMG_WIDTH) newWidth = MIN_IMG_WIDTH;
		if (newWidth > MAX_IMG_WIDTH) newWidth = MAX_IMG_WIDTH;
		this.imgEl.style.width = `${newWidth}px`;
	};

	private onMouseUp = (): void => {
		if (!this.dragging) return;
		this.dragging = false;
		const widthStr = this.imgEl.style.width.replace('px', '');
		const width = parseInt(widthStr, 10);
		const pos = this.getPos();
		const node = this.view.state.doc.nodeAt(pos);
		const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
			...node?.attrs,
			width,
		});
		this.view.dispatch(tr);
	};

	public update(node: ProseMirrorNode): boolean {
		if (node.type.name !== 'image') return false;
		if (typeof node.attrs.width === 'number') {
			this.imgEl.style.width = `${node.attrs.width}px`;
		}
		if (typeof node.attrs.src === 'string' && this.imgEl.src !== node.attrs.src) {
			this.imgEl.src = String(node.attrs.src);
		}
		return true;
	}

	public selectNode(): void {
		this.dom.classList.add('ProseMirror-selectednode');
	}
	public deselectNode(): void {
		this.dom.classList.remove('ProseMirror-selectednode');
	}
	public destroy(): void {
		this.handleEl.removeEventListener('mousedown', this.onMouseDown);
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onMouseUp);
		this.imgEl.removeEventListener('click', this.onImageClick);
	}
}

// width属性を持つImage拡張 + NodeView
const ResizableImage = Image.extend({
	addAttributes() {
		const parentFn = (this as unknown as { parent: () => Record<string, unknown> }).parent;
		const parentAttrs: Record<string, unknown> = typeof parentFn === 'function' ? parentFn() : {};
		return {
			...parentAttrs,
			width: {
				default: null,
				parseHTML: (element: HTMLElement): number | null => {
					const widthAttr = element.getAttribute('width') || element.getAttribute('data-width');
					return widthAttr ? parseInt(widthAttr, 10) : null;
				},
				renderHTML: (attributes: { width?: number | null }): Record<string, string> => {
					if (!attributes || attributes.width == null) return {};
					const w = String(attributes.width);
					return { width: w, 'data-width': w };
				},
			},
		};
	},
	addNodeView() {
		return ({ node, view, getPos }: { node: ProseMirrorNode; view: EditorView; getPos: boolean | (() => number) }) => new ResizableImageView(node as ProseMirrorNode, view as EditorView, getPos);
	},
});

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
	content,
	onContentChange,
	onHtmlChange,
	todoId,
	onImagePaste,
	onFileUpload: _onFileUpload,
}, ref) => {
	// クライアントサイドでのみレンダリング
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// HTMLからタグを除去してプレーンテキストを取得
	const stripHtml = (html: string): string => {
		const tmp = document.createElement('div');
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || '';
	};

	const editor = useEditor({
		extensions: [StarterKit, ResizableImage],
		content,
		editable: true,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			const plainText = stripHtml(html);
			console.log('エディター更新:', {
				todoId,
				htmlLength: html.length,
				htmlPreview: html.substring(0, 100) + '...',
				imageCount: (html.match(/<img/g) || []).length
			});
			onContentChange(plainText);
			if (onHtmlChange) {
				console.log('handleMemoHtmlChange 呼び出し:', {
					todoId,
					htmlLength: html.length,
					htmlPreview: html.substring(0, 50) + '...'
				});
				onHtmlChange(html);
				console.log('HTML更新完了');
			}
		},
	});

	// 初期化時のみ外部contentを反映
	const initializedRef = useRef(false);
	useEffect(() => {
		if (!editor) return;
		if (initializedRef.current) return;
		editor.commands.setContent(content, false);
		initializedRef.current = true;
	}, [editor, content]);

	// 外部からのcontent変更を反映
	useEffect(() => {
		if (!editor || !initializedRef.current) return;
		const currentContent = editor.getHTML();

		// 基本的な正規化（空白やスタイル差異を無視）
		const normalizeHtml = (html: string) => html.replace(/\s+/g, ' ').trim();
		const normalizedCurrent = normalizeHtml(currentContent);
		const normalizedNew = normalizeHtml(content);

		console.log('HTML更新チェック:', {
			todoId,
			currentLength: currentContent.length,
			newLength: content.length,
			currentHasSupabase: currentContent.includes('supabase.co/storage'),
			newHasSupabase: content.includes('supabase.co/storage'),
			currentHasDataUrl: currentContent.includes('src="data:'),
			newHasDataUrl: content.includes('src="data:'),
			currentNormalized: normalizedCurrent.substring(0, 100),
			newNormalized: normalizedNew.substring(0, 100)
		});

		// HTMLが実際に変更された場合のみ更新
		if (normalizedCurrent !== normalizedNew) {
			// エディター内に既にdata URLの画像がある場合は、外部からの更新をブロック
			const currentHasDataUrl = currentContent.includes('src="data:');
			const newHasSupabaseUrl = content.includes('supabase.co/storage');

			// data URLからSupabase URLへの変更の場合は必ず更新
			if (currentHasDataUrl && newHasSupabaseUrl) {
				console.log('画像URL更新を実行（data URL → Supabase URL）');
				editor.commands.setContent(content, false);
				return;
			}

			// エディター内にdata URLの画像がある場合は、外部からの空のHTML更新をブロック
			if (currentHasDataUrl && content.length < currentContent.length / 2) {
				console.log('エディター内に画像があるため、短いHTML更新をブロック:', {
					currentLength: currentContent.length,
					newLength: content.length
				});
				return;
			}

			// 新しいHTMLにSupabaseの画像URLが含まれている場合は必ず更新
			if (newHasSupabaseUrl && !currentHasDataUrl) {
				console.log('Supabase URL更新を実行');
				editor.commands.setContent(content, false);
				return;
			}

			// 画像を失う可能性がある更新を防ぐ
			const currentHasImages = currentContent.includes('<img');
			const newHasImages = content.includes('<img');

			if (currentHasImages && !newHasImages) {
				console.log('画像を失う可能性があるHTML更新をスキップ:', { currentLength: currentContent.length, newLength: content.length });
				return;
			}

			console.log('HTML更新実行:', { currentLength: currentContent.length, newLength: content.length });
			editor.commands.setContent(content, false);
		} else {
			console.log('HTML更新スキップ（変更なし）');
		}
	}, [editor, content, todoId]);

	// dataURL を File に変換
	const dataUrlToFile = (dataUrl: string, defaultFileName: string): File | null => {
		const commaIndex = dataUrl.indexOf(',');
		if (commaIndex === -1) return null;
		const header = dataUrl.substring(0, commaIndex);
		const base64 = dataUrl.substring(commaIndex + 1);
		const mimeMatch = header.match(/data:([^;]+);base64/i);
		const mimeType: string = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
		try {
			const byteString = atob(base64);
			const len = byteString.length;
			const u8 = new Uint8Array(len);
			for (let i = 0; i < len; i++) u8[i] = byteString.charCodeAt(i);
			return new File([u8], defaultFileName, { type: mimeType });
		} catch {
			return null;
		}
	};

	// 画像の貼り付け処理
	const handlePaste = useCallback(
		(event: ClipboardEvent) => {
			console.log('ペースト処理開始');
			const items = event.clipboardData?.items;
			const filesList = event.clipboardData?.files;
			if (!editor) {
				console.log('エディターが初期化されていません');
				return;
			}
			let handled = false;
			if (filesList && filesList.length > 0 && !handled) {
				console.log('ファイルリストから画像を検出:', filesList.length);
				const file = filesList[0];
				if (file && file.type.startsWith('image/')) {
					console.log('画像ファイルを検出:', file.name, file.type);
					const reader = new FileReader();
					reader.onload = () => {
						const result = reader.result;
						if (typeof result === 'string') {
							console.log('画像をエディターに挿入中...');
							console.log('data URL長さ:', result.length);
							console.log('data URLプレフィックス:', result.substring(0, 100));
							// エディター内に画像を挿入（リサイズ可能）
							const imageAttrs = {
								src: result,
								width: DEFAULT_IMG_WIDTH,
								alt: file.name || 'pasted-image'
							};
							console.log('setImageに渡す属性:', imageAttrs);
							const insertResult = editor.chain().focus().setImage(imageAttrs).run();
							console.log('画像挿入結果:', insertResult);
							console.log('挿入後のHTML:', editor.getHTML().substring(0, 200));
							console.log('コピペ画像をエディター内に挿入完了:', file.name);
							// 画像はエディター内のHTMLに含まれるため、ファイルリストには追加しない
						} else {
							console.error('FileReaderの結果が文字列ではありません:', typeof result, result);
						}
					};
					reader.onerror = (error) => {
						console.error('FileReader エラー:', error);
					};
					console.log('FileReader開始...');
					reader.readAsDataURL(file);
					handled = true;
				}
			}
			if (items && !handled) {
				console.log('クリップボードアイテムから画像を検索:', items.length);
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					console.log('アイテム', i, ':', item.type);
					if (item.type.indexOf('image') !== -1) {
						console.log('画像アイテムを検出:', item.type);
						const file = item.getAsFile();
						if (file) {
							console.log('ファイルオブジェクト取得成功:', file.name, file.type);
							const reader = new FileReader();
							reader.onload = () => {
								const result = reader.result;
								if (typeof result === 'string') {
									console.log('画像をエディターに挿入中...');
									console.log('data URL長さ:', result.length);
									console.log('data URLプレフィックス:', result.substring(0, 100));
									// エディター内に画像を挿入（リサイズ可能）
									const imageAttrs = {
										src: result,
										width: DEFAULT_IMG_WIDTH,
										alt: file.name || 'pasted-image'
									};
									console.log('setImageに渡す属性:', imageAttrs);
									const insertResult = editor.chain().focus().setImage(imageAttrs).run();
									console.log('画像挿入結果:', insertResult);
									console.log('挿入後のHTML:', editor.getHTML().substring(0, 200));
									console.log('コピペ画像をエディター内に挿入完了:', file.name);
									// 画像はエディター内のHTMLに含まれるため、ファイルリストには追加しない
								} else {
									console.error('FileReaderの結果が文字列ではありません:', typeof result, result);
								}
							};
							reader.onerror = (error) => {
								console.error('FileReader エラー:', error);
							};
							console.log('FileReader開始...');
							reader.readAsDataURL(file);
							handled = true;
							break;
						}
					}
				}
			}
			if (!handled && event.clipboardData) {
				const html = event.clipboardData.getData('text/html');
				if (html && html.includes('<img')) {
					console.log('HTMLから画像URLを抽出');
					const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
					const src = match ? match[1] : '';
					if (src.startsWith('data:image')) {
						console.log('画像をエディターに挿入中...');
						const imageAttrs = {
							src: src,
							width: DEFAULT_IMG_WIDTH,
							alt: 'pasted-image'
						};
						console.log('setImageに渡す属性:', imageAttrs);
						const insertResult = editor.chain().focus().setImage(imageAttrs).run();
						console.log('画像挿入結果:', insertResult);
						const _f = dataUrlToFile(src, 'pasted-image.png');
						console.log('HTMLから画像をエディター内に挿入完了');
						// 画像はエディター内のHTMLに含まれるため、ファイルリストには追加しない
						handled = true;
					}
				}
			}
			if (!handled && event.clipboardData) {
				const text = event.clipboardData.getData('text/plain');
				if (text && text.startsWith('data:image')) {
					console.log('テキストから画像URLを検出');
					console.log('画像をエディターに挿入中...');
					const imageAttrs = {
						src: text,
						width: DEFAULT_IMG_WIDTH,
						alt: 'pasted-image'
					};
					console.log('setImageに渡す属性:', imageAttrs);
					const insertResult = editor.chain().focus().setImage(imageAttrs).run();
					console.log('画像挿入結果:', insertResult);
					const _f2 = dataUrlToFile(text, 'pasted-image.png');
					console.log('テキストから画像をエディター内に挿入完了');
					// 画像はエディター内のHTMLに含まれるため、ファイルリストには追加しない
					handled = true;
				}
			}
			if (handled) {
				console.log('ペースト処理完了、デフォルト動作を防止');
				event.preventDefault();
			} else {
				console.log('画像が見つからず、ペースト処理をスキップ');
			}
		},
		[editor, todoId]
	);

	// onImagePasteコールバックを拡張して、自動的にエディターに挿入
	const _handleImagePasteWithInsertion = useCallback((file: File) => {
		if (!editor) return;

		// ファイルタイプチェック
		if (!file.type.startsWith('image/')) {
			console.warn('選択されたファイルは画像ではありません:', file.type);
			return;
		}

		// FileReaderで画像をdata URLに変換してエディターに挿入
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result === 'string') {
				// エディターに画像を挿入
				editor.chain().focus().setImage({ src: result, width: DEFAULT_IMG_WIDTH }).run();
			}
		};
		reader.onerror = () => {
			console.error('画像ファイルの読み込みに失敗しました');
		};

		// ファイルをdata URLとして読み込み
		reader.readAsDataURL(file);

		// 元のonImagePasteコールバックも呼び出し
		onImagePaste?.(todoId, file);
	}, [editor, todoId, onImagePaste]);

	// 外部からファイルを挿入するための関数
	const insertFileIntoEditor = useCallback((file: File) => {
		console.log('insertFileIntoEditor呼び出し:', file.name, file.type, file.size);
		if (!editor) {
			console.warn('エディターが初期化されていません');
			return;
		}

		if (file.type.startsWith('image/')) {
			console.log('画像ファイルをエディター内に挿入開始:', file.name);
			// FileReaderで画像をdata URLに変換してエディターに挿入
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result === 'string') {
					console.log('FileReader完了、エディターに挿入中...', result.substring(0, 50) + '...');
					// エディターのカーソル位置に画像を挿入
					const imageAttrs = {
						src: result,
						width: DEFAULT_IMG_WIDTH,
						alt: file.name || 'uploaded-image'
					};
					console.log('setImageに渡す属性:', imageAttrs);
					const success = editor.chain().focus().setImage(imageAttrs).run();
					console.log('エディターへの画像挿入結果:', success);
					console.log('画像をエディター内に挿入完了:', file.name);
				} else {
					console.error('FileReaderの結果が文字列ではありません:', typeof result, result);
				}
			};
			reader.onerror = () => {
				console.error('画像ファイルの読み込みに失敗しました:', reader.error);
			};
			console.log('FileReader開始...');
			reader.readAsDataURL(file);

			// 画像はエディター内のHTMLに含まれるため、ファイルリストには追加しない
		} else {
			console.log('非画像ファイルを添付:', file.name);
			// 画像以外はファイルリストにのみ追加
			onImagePaste?.(todoId, file);
		}
	}, [editor, todoId, onImagePaste]);

	// refを通じて外部からアクセス可能なメソッドを提供
	useImperativeHandle(ref, () => ({
		insertFileIntoEditor
	}), [insertFileIntoEditor]);

	const handleReactPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
		handlePaste(e.nativeEvent as ClipboardEvent);
	}, [handlePaste]);

	useEffect(() => {
		if (!editor) return;
		const el = editor.view.dom;
		const listener = (e: Event) => handlePaste(e as ClipboardEvent);
		el.addEventListener('paste', listener);
		return () => {
			el.removeEventListener('paste', listener);
		};
	}, [editor, handlePaste]);

	if (!isMounted) {
		return (
			<div className='w-full p-2 text-[13px] min-h-[48px] max-h-[600px] overflow-y-auto text-gray-600 bg-gray-100 rounded border-0 focus:outline-none focus:ring-0 focus:border-0'>
				エディターを読み込み中...
			</div>
		);
	}

	if (!editor) {
		return (
			<div className='w-full p-2 text-[13px] min-h-[48px] max-h-[600px] overflow-y-auto text-gray-600 bg-gray-100 rounded border-0 focus:outline-none focus:ring-0 focus:border-0'>
				読み込み中...
			</div>
		);
	}

	return (
		<div className='space-y-2'>
			<div className='bg-gray-100 rounded-md p-1 relative'>
				<EditorContent
					editor={editor}
					onPaste={handleReactPaste}
					className='w-full p-1 text-[13px] min-h-[48px] max-h-[600px] overflow-y-auto text-gray-600 bg-gray-100 rounded border-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:ring-0 [&_.ProseMirror]:shadow-none [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:max-w-full'
				/>
			</div>
		</div>
	);
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
