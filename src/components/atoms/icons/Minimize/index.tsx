type Props = { className?: string; strokeWidth?: number };
export default function IconMinimize({ className = 'w-4 h-4', strokeWidth = 2 }: Props) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
			<polyline points="15 9 15 3 21 3" />
			<polyline points="9 15 3 15 3 21" />
			<polyline points="21 9 21 3 15 3" />
			<polyline points="3 21 9 21 9 15" />
		</svg>
	);
} 