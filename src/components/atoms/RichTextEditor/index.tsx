'use client';

import Image from '@tiptap/extension-image';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { EditorView, NodeView } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
	content: string;
	onContentChange: (content: string) => void;
	onHtmlChange?: (html: string) => void;
	todoId: string;
	onImagePaste?: (todoId: string, file: File) => void;
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

	constructor(node: PMNode, view: EditorView, getPos: boolean | (() => number)) {
		this.view = view;
		this.getPos = (getPos as () => number);

		this.dom = document.createElement('span');
		this.dom.style.display = 'inline-block';
		this.dom.style.position = 'relative';
		this.dom.style.verticalAlign = 'middle';

		this.imgEl = document.createElement('img');
		this.imgEl.src = String(node.attrs.src ?? '');
		this.imgEl.alt = String(node.attrs.alt ?? '');
		this.imgEl.style.height = 'auto';
		this.imgEl.style.maxWidth = '100%';
		this.imgEl.style.display = 'inline-block';
		this.imgEl.style.cursor = 'zoom-in';
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

	public update(node: PMNode): boolean {
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
		return {
			...this.parent?.(),
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
		return ({ node, view, getPos }) => new ResizableImageView(node as unknown as PMNode, view as EditorView, getPos);
	},
});

export default function RichTextEditor({
	content,
	onContentChange,
	onHtmlChange,
	todoId,
	onImagePaste,
}: RichTextEditorProps) {
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
			onContentChange(plainText);
			if (onHtmlChange) onHtmlChange(html);
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
			const items = event.clipboardData?.items;
			const filesList = event.clipboardData?.files;
			if (!editor) return;
			let handled = false;
			if (filesList && filesList.length > 0 && !handled) {
				const file = filesList[0];
				if (file && file.type.startsWith('image/')) {
					const reader = new FileReader();
					reader.onload = () => {
						const result = reader.result;
						if (typeof result === 'string') {
							editor.chain().focus().setImage({ src: result, width: DEFAULT_IMG_WIDTH }).run();
							onImagePaste?.(todoId, file);
						}
					};
					reader.readAsDataURL(file);
					handled = true;
				}
			}
			if (items && !handled) {
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					if (item.type.indexOf('image') !== -1) {
						const file = item.getAsFile();
						if (file) {
							const reader = new FileReader();
							reader.onload = () => {
								const result = reader.result;
								if (typeof result === 'string') {
									editor.chain().focus().setImage({ src: result, width: DEFAULT_IMG_WIDTH }).run();
									onImagePaste?.(todoId, file);
								}
							};
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
					const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
					const src = match ? match[1] : '';
					if (src.startsWith('data:image')) {
						editor.chain().focus().setImage({ src, width: DEFAULT_IMG_WIDTH }).run();
						const f = dataUrlToFile(src, 'pasted-image.png');
						if (f) onImagePaste?.(todoId, f);
						handled = true;
					}
				}
			}
			if (!handled && event.clipboardData) {
				const text = event.clipboardData.getData('text/plain');
				if (text && text.startsWith('data:image')) {
					editor.chain().focus().setImage({ src: text, width: DEFAULT_IMG_WIDTH }).run();
					const f = dataUrlToFile(text, 'pasted-image.png');
					if (f) onImagePaste?.(todoId, f);
					handled = true;
				}
			}
			if (handled) event.preventDefault();
		},
		[editor, onImagePaste, todoId]
	);

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
}
