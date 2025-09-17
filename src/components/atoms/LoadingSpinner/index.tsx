interface LoadingSpinnerProps {
	message?: string;
	size?: 'sm' | 'md' | 'lg';
	fullScreen?: boolean;
}

export default function LoadingSpinner({
	message = 'データを読み込み中...',
	size = 'md',
	fullScreen = false
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'w-6 h-6',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};

	const textSizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};

	const containerClasses = fullScreen
		? 'flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100'
		: 'flex items-center justify-center min-h-[200px] w-full';

	return (
		<div className={containerClasses}>
			<div className="text-center flex flex-col items-center justify-center">
				{/* アニメーション付きローディングアイコン */}
				<div className="relative mb-4 flex items-center justify-center">
					{/* 外側の回転リング */}
					<div className={`${sizeClasses[size]} border-2 border-neutral-200 rounded-full animate-spin`}>
						<div className="w-full h-full border-2 border-transparent border-t-black rounded-full"></div>
					</div>
				</div>

				{/* ローディングテキスト */}
				<div className={`${textSizeClasses[size]} text-neutral-600 font-medium`}>
					{message}
				</div>
			</div>
		</div>
	);
}
