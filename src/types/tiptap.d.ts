declare module '@tiptap/core' {
	export type AttributeMap = Record<string, unknown>;

	export interface CommandChain {
		focus: () => CommandChain;
		setImage: (attrs: { src: string; width?: number }) => CommandChain;
		updateAttributes: (name: string, attrs: AttributeMap) => CommandChain;
		run: () => boolean;
	}

	export interface EditorViewLike {
		dom: HTMLElement;
	}

	export interface Editor {
		commands: {
			setContent: (content: string, emitUpdate?: boolean) => void;
		};
		getHTML: () => string;
		chain: () => CommandChain;
		view: EditorViewLike;
	}

	export abstract class Extension {
		configure(config: Record<string, unknown>): this;
		extend(options: Record<string, unknown>): Extension;
	}
}

declare module '@tiptap/react' {
	import type { Editor } from '@tiptap/core';
    import type { HTMLAttributes, ReactElement } from 'react';

	export type EditorContentProps = HTMLAttributes<HTMLDivElement> & {
		editor: Editor | null;
	};

	export function EditorContent(props: EditorContentProps): ReactElement;

	export interface UseEditorOptions {
		extensions: unknown[];
		content?: string;
		editable?: boolean;
		immediatelyRender?: boolean;
		onUpdate?: (arg: { editor: Editor }) => void;
	}

	export function useEditor(config: UseEditorOptions): Editor | null;
}

declare module '@tiptap/starter-kit' {
	import type { Extension } from '@tiptap/core';
	const StarterKit: Extension;
	export default StarterKit;
}

declare module '@tiptap/extension-image' {
	import type { Extension } from '@tiptap/core';
	const Image: Extension & { extend: (options: Record<string, unknown>) => Extension };
	export default Image;
}

declare module '@tiptap/extension-placeholder' {
	import type { Extension } from '@tiptap/core';
	const Placeholder: Extension;
	export default Placeholder;
}

declare module '@tiptap/extension-text-align' {
	import type { Extension } from '@tiptap/core';
	const TextAlign: Extension;
	export default TextAlign;
}

// ProseMirror minimal types used in NodeView
declare module '@tiptap/pm/model' {
	export interface ImageNodeAttrs {
		width?: number;
		src?: string;
		[key: string]: unknown;
	}

	export interface ProseMirrorNode {
		attrs: ImageNodeAttrs;
		type: { name: string };
	}
}

declare module '@tiptap/pm/view' {
	import type { ProseMirrorNode } from '@tiptap/pm/model';
	export interface EditorStateLike {
		tr: {
			setNodeMarkup: (pos: number, type?: unknown, attrs?: Record<string, unknown>) => unknown;
		};
		doc: {
			nodeAt: (pos: number) => (ProseMirrorNode | null);
		};
	}

	export interface EditorView {
		state: EditorStateLike;
		dispatch: (tr: unknown) => void;
		dom: HTMLElement;
	}

	export interface NodeView {
		dom: HTMLElement;
		update?: (node: ProseMirrorNode) => boolean;
		selectNode?: () => void;
		deselectNode?: () => void;
		destroy?: () => void;
	}

	export type NodeViewConstructor = (props: { node: ProseMirrorNode; view: EditorView; getPos: boolean | (() => number) }) => NodeView;
}
