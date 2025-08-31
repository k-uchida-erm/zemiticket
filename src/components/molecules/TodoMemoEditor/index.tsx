import RichTextEditor from '../../atoms/RichTextEditor';

interface TodoMemoEditorProps {
	todoId: string;
	html: string;
	onContentChange: (todoId: string, content: string) => void;
	onHtmlChange?: (todoId: string, html: string) => void;
	onImagePaste?: (todoId: string, file: File) => void;
	onImageDelete?: (todoId: string, imageIndex: number) => void;
	onSave?: (todoId: string) => void;
	onCancel?: (todoId: string) => void;
	onDelete?: (todoId: string) => void;
	todoFiles?: Record<string, File[]>;
	onFileDelete?: (todoId: string, fileIndex: number) => void;
	formatFileSize?: (bytes: number) => string;
}

export default function TodoMemoEditor({
	todoId,
	html,
	onContentChange,
	onHtmlChange,
	onImagePaste,
	onImageDelete,
	onSave,
	onCancel,
	onDelete,
	todoFiles,
	onFileDelete,
	formatFileSize,
}: TodoMemoEditorProps) {
	return (
		<div className='space-y-2'>
			<RichTextEditor
				content={html}
				todoId={todoId}
				onContentChange={(text) => onContentChange(todoId, text)}
				onHtmlChange={onHtmlChange ? (htmlStr) => onHtmlChange(todoId, htmlStr) : undefined}
				onImagePaste={onImagePaste}
				onImageDelete={onImageDelete}
				onSave={onSave}
				onCancel={onCancel}
				onDelete={onDelete}
				todoFiles={todoFiles}
				onFileDelete={onFileDelete}
				formatFileSize={formatFileSize}
			/>
		</div>
	);
}
