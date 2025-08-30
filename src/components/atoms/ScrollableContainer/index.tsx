interface ScrollableContainerProps {
	children: React.ReactNode;
	className?: string;
}

export default function ScrollableContainer({ children, className = "" }: ScrollableContainerProps) {
	return (
		<div 
			className={`overflow-y-auto ${className}`} 
			style={{ 
				scrollbarWidth: 'thin',
				msOverflowStyle: 'none',
				paddingTop: '1.25rem', // ヘッダー下の余白（pt-5相当）
				maxHeight: 'calc(100vh - 4rem)' // ヘッダー(4rem)のみを除いた画面高さ
			}}
		>
			{children}
		</div>
	);
} 