"use client";

interface DropZoneProps {
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
}

export default function DropZone({ onDragOver, onDrop }: DropZoneProps) {
	return (
		<div 
			className="flex flex-col items-center justify-center py-8"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className="mb-6">
				<div className="w-16 h-16 rounded-full bg-[#00b393] flex items-center justify-center">
					<svg className="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
				</div>
			</div>
			<p className="text-[#00b393] text-lg font-medium">アクティブな親チケットを左からここへドロップ</p>
		</div>
	);
} 