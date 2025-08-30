"use client";

interface SubmitButtonProps {
	allCompleted: boolean;
	onSubmit?: () => void;
}

export default function SubmitButton({ allCompleted, onSubmit }: SubmitButtonProps) {
	if (allCompleted) {
		// 全部完了：緑色のボタン
		return (
			<button 
				onClick={onSubmit}
				className="px-3 py-1.5 bg-[#00b393] text-white text-xs font-medium rounded-md hover:bg-[#00b393]/80 transition-colors shadow-md"
			>
				Submit
			</button>
		);
	} else {
		// 未完了：グレーのボタン（押せない）
		return (
			<button 
				disabled 
				className="px-3 py-1.5 bg-gray-400 text-gray-200 text-xs font-medium rounded-md cursor-not-allowed shadow-sm"
			>
				Submit
			</button>
		);
	}
} 