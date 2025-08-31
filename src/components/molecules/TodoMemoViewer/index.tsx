interface TodoMemoViewerProps {
	todoId: string;
	html?: string;
	content?: string;
	images?: Array<File | string>;
	onImageDelete?: (todoId: string, imageIndex: number) => void;
}

function sanitize(html: string): string {
	return html
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
		.replace(/ on[a-z]+="[^"]*"/gi, '')
		.replace(/ on[a-z]+=\'[^\']*\'/gi, '');
}

export default function TodoMemoViewer({ todoId, html, content, images, onImageDelete }: TodoMemoViewerProps) {
	const hasHtml: boolean = Boolean(html && html.trim().length > 0);
	const hasInlineImages: boolean = hasHtml ? (html as string).includes('<img') : false;
	return (
		<div className='relative'>
			{hasHtml ? (
				<div
					className='text-[13px] text-gray-700 whitespace-pre-wrap break-words leading-relaxed'
					dangerouslySetInnerHTML={{ __html: sanitize(html as string) }}
				/>
			) : (
				<div className='text-[13px] text-gray-700 whitespace-pre-wrap break-words leading-relaxed'>
					{content || ''}
				</div>
			)}

			{!hasInlineImages && images && images.length > 0 && (
				<>
					{images.map((image, index) => {
						const imageSrc: string | null = typeof image === 'string' ? image : (image instanceof File ? URL.createObjectURL(image) : null);
						if (!imageSrc) return null;
						return (
							<span
								key={index}
								className='relative inline-block group mr-2 align-text-bottom'
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Delete' || e.key === 'Backspace') {
										e.preventDefault();
										onImageDelete?.(todoId, index);
									}
								}}
								onFocus={(e) => {
									e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
								}}
								onBlur={(e) => {
									e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
								}}
							>
								<img
									src={imageSrc}
									alt={`画像${index + 1}`}
									className='w-[400px] h-[300px] object-contain border border-gray-200 rounded hover:border-gray-300 transition-colors cursor-pointer'
									onClick={() => {
										const modal = document.createElement('div');
										modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
										modal.onclick = () => modal.remove();
										const img = document.createElement('img');
										img.src = imageSrc;
										img.className = 'max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg';
										img.alt = `画像${index + 1}`;
										modal.appendChild(img);
										document.body.appendChild(modal);
									}}
								/>
								<button
									onClick={() => onImageDelete?.(todoId, index)}
									className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
								>
									×
								</button>
							</span>
						);
					})}
				</>
			)}
		</div>
	);
}
