import { forwardRef, useImperativeHandle, useRef } from 'react';
import RichTextEditor, { RichTextEditorRef } from '../../atoms/RichTextEditor';

interface TodoMemoEditorProps {
	todoId: string;
	html: string;
	onContentChange: (todoId: string, content: string) => void;
	onHtmlChange?: (todoId: string, html: string) => void;
	onImagePaste?: (todoId: string, file: File) => void;
}

// 外部から呼び出せるメソッドの型定義
export interface TodoMemoEditorRef {
	insertFile: (file: File) => void;
}

const TodoMemoEditor = forwardRef<TodoMemoEditorRef, TodoMemoEditorProps>(({
	todoId,
	html,
	onContentChange,
	onHtmlChange,
	onImagePaste,
}, ref) => {
	const richTextEditorRef = useRef<RichTextEditorRef>(null);

	// refを通じて外部からアクセス可能なメソッドを提供
	useImperativeHandle(ref, () => ({
		insertFile: (file: File) => {
			console.log('TodoMemoEditor.insertFile呼び出し:', file.name);
			if (richTextEditorRef.current) {
				console.log('RichTextEditorのinsertFileIntoEditorを呼び出し');
				richTextEditorRef.current.insertFileIntoEditor(file);
			} else {
				console.error('RichTextEditorのrefが設定されていません');
			}
		}
	}), []);

	return (
		<div className='space-y-2'>
			<RichTextEditor
				ref={richTextEditorRef}
				content={html}
				todoId={todoId}
				onContentChange={(content: string) => onContentChange(todoId, content)}
				onHtmlChange={(html: string) => onHtmlChange?.(todoId, html)}
				onImagePaste={onImagePaste}
			/>
		</div>
	);
});

TodoMemoEditor.displayName = 'TodoMemoEditor';

export default TodoMemoEditor;
