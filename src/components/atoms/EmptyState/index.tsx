interface EmptyStateProps {
	message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
	return (
		<div className="mt-5 text-center text-neutral-500">
			{message}
		</div>
	);
} 
 