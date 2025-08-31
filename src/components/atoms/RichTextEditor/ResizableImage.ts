import { Node, mergeAttributes } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorView, NodeView, NodeViewConstructor } from '@tiptap/pm/view';

interface ResizableImageOptions {
	HTMLAttributes: Record<string, string>;
	minWidth: number;
	maxWidth: number;
	defaultWidth: number;
}

class ResizableImageView implements NodeView {
	public dom: HTMLElement;
	private readonly imgEl: HTMLImageElement;
	private readonly handleEl: HTMLDivElement;
	private readonly getPos: () => number;
	private readonly view: EditorView;
	private dragging: boolean = false;
	private startX: number = 0;
	private startWidth: number = 0;
	private readonly minWidth: number;
	private readonly maxWidth: number;

	constructor(node: ProseMirrorNode, view: EditorView, getPos: boolean | (() => number), minWidth: number, maxWidth: number) {
		this.view = view;
		this.getPos = getPos as () => number;
		this.minWidth = minWidth;
		this.maxWidth = maxWidth;

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
	}

	private onMouseDown = (e: MouseEvent): void => {
		e.preventDefault();
		this.dragging = true;
		this.startX = e.clientX;
		this.startWidth = this.imgEl.getBoundingClientRect().width;
	};

	private onMouseMove = (e: MouseEvent): void => {
		if (!this.dragging) return;
		const delta: number = e.clientX - this.startX;
		let newWidth: number = Math.round(this.startWidth + delta);
		if (newWidth < this.minWidth) newWidth = this.minWidth;
		if (newWidth > this.maxWidth) newWidth = this.maxWidth;
		this.updateWidth(newWidth);
	};

	private onMouseUp = (): void => {
		if (!this.dragging) return;
		this.dragging = false;
		// 最終値をattrsへ反映
		const widthStr: string = this.imgEl.style.width.replace('px', '');
		const width: number = parseInt(widthStr, 10);
		const pos: number = this.getPos();
		const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
			...this.view.state.doc.nodeAt(pos)?.attrs,
			width,
		});
		this.view.dispatch(tr);
	};

	private updateWidth(width: number): void {
		this.imgEl.style.width = `${width}px`;
	}

	public update(node: ProseMirrorNode): boolean {
		if (node.type.name !== 'resizableImage') return false;
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
	}
}

export const ResizableImage = Node.create<ResizableImageOptions>({
	name: 'resizableImage',
	group: 'inline',
	inline: true,
	selectable: true,
	atom: true,
	addOptions() {
		return {
			HTMLAttributes: {},
			minWidth: 60,
			maxWidth: 1200,
			defaultWidth: 400,
		};
	},
	addAttributes() {
		return {
			src: { default: null },
			alt: { default: null },
			width: { default: this.options.defaultWidth },
		};
	},
	parseHTML() {
		return [
			{
				tag: 'img[data-resizable-image]'
			}
		];
	},
	renderHTML({ HTMLAttributes }) {
		return ['img', mergeAttributes(HTMLAttributes, { 'data-resizable-image': 'true' })];
	},
	addNodeView(): NodeViewConstructor {
		return ({ node, view, getPos }) => new ResizableImageView(node, view, getPos, this.options.minWidth, this.options.maxWidth);
	},
});
