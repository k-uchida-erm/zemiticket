"use client";

interface DeactivateButtonProps {
	onDeactivate: () => void;
}

export default function DeactivateButton({ onDeactivate }: DeactivateButtonProps) {
	return (
		<button 
			onClick={onDeactivate}
			className="w-8 h-8 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md flex items-center justify-center"
			title="非アクティブ化"
		>
			<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
			</svg>
		</button>
	);
} 