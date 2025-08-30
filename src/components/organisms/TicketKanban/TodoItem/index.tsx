"use client";

interface TodoItemProps {
	todo: {
		id: string | number;
		title: string;
		done: boolean;
	};
	subtaskId: string | number;
	onTodoToggle?: (subtaskId: string, todoId: string, done: boolean) => void;
}

export default function TodoItem({ todo, subtaskId, onTodoToggle }: TodoItemProps) {
	const handleClick = () => {
		if (onTodoToggle) {
			onTodoToggle(subtaskId.toString(), todo.id.toString(), !todo.done);
		}
	};

	return (
		<div 
			className="flex items-center gap-2 text-[10px] text-neutral-600 cursor-pointer hover:bg-neutral-100 p-1 rounded"
			onClick={handleClick}
		>
			<div 
				className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-colors ${
					todo.done 
						? 'bg-[#00b393] border-[#00b393]' 
						: 'bg-white border-neutral-400'
				}`}
			>
				{todo.done && (
					<svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
					</svg>
				)}
			</div>
			<span className={todo.done ? 'line-through text-neutral-400' : ''}>
				{todo.title}
			</span>
		</div>
	);
} 