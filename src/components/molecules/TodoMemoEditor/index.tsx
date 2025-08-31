import RichTextEditor from '../../atoms/RichTextEditor';

interface TodoMemoEditorProps {
	todoId: string;
	html: string;
	onContentChange: (todoId: string, content: string) => void;
	onHtmlChange?: (todoId: string, html: string) => void;
	onImagePaste?: (todoId: string, file: File) => void;
}

export default function TodoMemoEditor({
	todoId,
	html,
	onContentChange,
	onHtmlChange,
	onImagePaste,
}: TodoMemoEditorProps) {
	return (
		<div className='space-y-2'>
			<RichTextEditor
				content={html}
				todoId={todoId}
				onContentChange={(text) => onContentChange(todoId, text)}
				onHtmlChange={onHtmlChange ? (htmlStr) => onHtmlChange(todoId, htmlStr) : undefined}
				onImagePaste={onImagePaste}
			/>
		</div>
	);
}
