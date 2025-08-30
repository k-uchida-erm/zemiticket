interface LoadingSpinnerProps {
	message?: string;
}

export default function LoadingSpinner({ message = "データを読み込み中..." }: LoadingSpinnerProps) {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-lg">{message}</div>
		</div>
	);
} 